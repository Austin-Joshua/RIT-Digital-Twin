package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.util.ErpException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssignmentSecurityTest {

    AssignmentRepository assignmentRepository;
    AssignmentSubmissionRepository submissionRepository;
    StudentRepository studentRepository;
    StudentSubjectRepository studentSubjectRepository;
    FacultyProfileRepository facultyProfileRepository;
    AssignmentController assignmentController;

    @BeforeEach
    void setUp() {
        assignmentRepository = mock(AssignmentRepository.class);
        submissionRepository = mock(AssignmentSubmissionRepository.class);
        studentRepository = mock(StudentRepository.class);
        studentSubjectRepository = mock(StudentSubjectRepository.class);
        facultyProfileRepository = mock(FacultyProfileRepository.class);

        assignmentController = new AssignmentController(
                assignmentRepository,
                submissionRepository,
                studentRepository,
                studentSubjectRepository,
                facultyProfileRepository
        );
    }

    @Test
    void studentCannotSubmitAssignmentIfNotEnrolledInSubject() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student student = Student.builder().id(100L).user(studentUser).build();
        when(studentRepository.findByUser_Id(10L)).thenReturn(Optional.of(student));

        Subject subjectCSE = Subject.builder().id(501L).subjectCode("CS101").build();
        Assignment assignment = Assignment.builder().id(1L).subject(subjectCSE).maxMarks(100).build();
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));

        // Student is only enrolled in ECE subject 999
        Subject subjectECE = Subject.builder().id(999L).subjectCode("EC101").build();
        StudentSubject ss = StudentSubject.builder().studentSubjectId(1L).student(student).subject(subjectECE).build();
        when(studentSubjectRepository.findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(100L))
                .thenReturn(List.of(ss));

        // Submit should be rejected with UnauthorizedException
        assertThrows(ErpException.UnauthorizedException.class, () -> {
            assignmentController.submitAssignmentJson(1L, Map.of("fileName", "lab1.pdf"));
        });

        verify(submissionRepository, never()).save(any());
    }

    @Test
    void maliciousFileNameRejectedOnSubmission() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student student = Student.builder().id(100L).user(studentUser).build();
        when(studentRepository.findByUser_Id(10L)).thenReturn(Optional.of(student));

        Subject subjectCSE = Subject.builder().id(501L).subjectCode("CS101").build();
        Assignment assignment = Assignment.builder().id(1L).subject(subjectCSE).maxMarks(100).build();
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));

        StudentSubject ss = StudentSubject.builder().studentSubjectId(1L).student(student).subject(subjectCSE).build();
        when(studentSubjectRepository.findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(100L))
                .thenReturn(List.of(ss));

        // Attempting path traversal filename
        assertThrows(ErpException.InvalidOperationException.class, () -> {
            assignmentController.submitAssignmentJson(1L, Map.of("fileName", "../../etc/passwd"));
        });

        // Attempting executable filename
        assertThrows(ErpException.InvalidOperationException.class, () -> {
            assignmentController.submitAssignmentJson(1L, Map.of("fileName", "malicious_script.jsp"));
        });
    }

    @Test
    void gradeSubmissionRejectsNegativeScoreOrScoreExceedingMaxMarks() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        User facultyUser = User.builder().userId(20L).username("faculty.cse").role(facultyRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyUser, null, facultyUser.getAuthorities())
        );

        Assignment assignment = Assignment.builder().id(1L).faculty(facultyUser).maxMarks(50).build();
        AssignmentSubmission submission = AssignmentSubmission.builder().id(10L).assignment(assignment).build();
        when(submissionRepository.findById(10L)).thenReturn(Optional.of(submission));

        // Score negative
        assertThrows(ErpException.BadRequestException.class, () -> {
            assignmentController.gradeSubmission(10L, Map.of("score", -5));
        });

        // Score exceeds max marks (55 > 50)
        assertThrows(ErpException.BadRequestException.class, () -> {
            assignmentController.gradeSubmission(10L, Map.of("score", 55));
        });
    }

    @Test
    void unauthorizedFacultyCannotGradeAssignment() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        User facultyUser = User.builder().userId(20L).username("faculty.cse").role(facultyRole).build();
        User otherFaculty = User.builder().userId(99L).username("faculty.other").role(facultyRole).build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyUser, null, facultyUser.getAuthorities())
        );

        Assignment assignment = Assignment.builder().id(1L).faculty(otherFaculty).maxMarks(50).build();
        AssignmentSubmission submission = AssignmentSubmission.builder().id(10L).assignment(assignment).build();
        when(submissionRepository.findById(10L)).thenReturn(Optional.of(submission));

        assertThrows(ErpException.UnauthorizedException.class, () -> {
            assignmentController.gradeSubmission(10L, Map.of("score", 45));
        });
    }

    @Test
    void studentCannotDownloadAnotherStudentSubmission() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentA = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        User studentB = User.builder().userId(11L).username("2117240020045").role(studentRole).build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentA, null, studentA.getAuthorities())
        );

        Student ownerStudent = Student.builder().id(101L).user(studentB).build();
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .id(50L)
                .student(ownerStudent)
                .fileName("solution.pdf")
                .build();
        when(submissionRepository.findById(50L)).thenReturn(Optional.of(submission));

        // Student A attempting to download Student B's submission
        assertThrows(ErpException.UnauthorizedException.class, () -> {
            assignmentController.downloadSubmissionFile(50L);
        });
    }

    @Test
    void unauthorizedFacultyCannotDownloadSubmission() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        User facultyA = User.builder().userId(20L).username("faculty.cse").role(facultyRole).build();
        User facultyB = User.builder().userId(21L).username("faculty.ece").role(facultyRole).build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyA, null, facultyA.getAuthorities())
        );

        Assignment assignment = Assignment.builder().id(1L).faculty(facultyB).build();
        Student student = Student.builder().id(100L).build();
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .id(60L)
                .assignment(assignment)
                .student(student)
                .fileName("report.pdf")
                .build();
        when(submissionRepository.findById(60L)).thenReturn(Optional.of(submission));

        assertThrows(ErpException.UnauthorizedException.class, () -> {
            assignmentController.downloadSubmissionFile(60L);
        });
    }

    @Test
    void studentCanDownloadOwnSubmission() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student student = Student.builder().id(100L).user(studentUser).build();
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .id(70L)
                .student(student)
                .fileName("my_lab.pdf")
                .fileUrl("assignments/test_key.pdf")
                .build();
        when(submissionRepository.findById(70L)).thenReturn(Optional.of(submission));

        var response = assignmentController.downloadSubmissionFile(70L);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("my_lab.pdf"));
    }

    @Test
    void multipartFileUploadSucceedsForEnrolledStudent() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student student = Student.builder().id(100L).user(studentUser).build();
        when(studentRepository.findByUser_Id(10L)).thenReturn(Optional.of(student));

        Subject subjectCSE = Subject.builder().id(501L).subjectCode("CS101").build();
        Assignment assignment = Assignment.builder().id(1L).subject(subjectCSE).maxMarks(100).build();
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));

        StudentSubject ss = StudentSubject.builder().studentSubjectId(1L).student(student).subject(subjectCSE).build();
        when(studentSubjectRepository.findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(100L))
                .thenReturn(List.of(ss));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(i -> {
            AssignmentSubmission s = i.getArgument(0);
            s.setId(888L);
            return s;
        });

        // Real PDF bytes starting with %PDF-
        byte[] pdfBytes = "%PDF-1.4\n% Test real PDF submission stream".getBytes();
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "genuine_lab_report.pdf", "application/pdf", pdfBytes
        );

        var response = assignmentController.submitAssignmentMultipart(1L, mockFile);
        assertEquals(200, response.getStatusCode().value());
        assertTrue((Boolean) response.getBody().get("success"));
        assertEquals("SUBMITTED", response.getBody().get("status"));
        assertEquals(888L, response.getBody().get("submissionId"));
    }
}
