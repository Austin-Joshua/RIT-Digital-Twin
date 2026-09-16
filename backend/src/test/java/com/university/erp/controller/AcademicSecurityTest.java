package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.service.AcademicService;
import com.university.erp.service.StudentAcademicOnboardingService;
import com.university.erp.service.StudentProfileService;
import com.university.erp.util.ErpException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AcademicSecurityTest {

    AcademicService academicService;
    StudentProfileService studentProfileService;
    StudentAcademicOnboardingService onboardingService;
    StudentLeaveRequestRepository leaveRequestRepository;
    ParentRepository parentRepository;
    StudentRepository studentRepository;
    AuditLogRepository auditLogRepository;
    AcademicController academicController;

    @BeforeEach
    void setUp() {
        academicService = mock(AcademicService.class);
        studentProfileService = mock(StudentProfileService.class);
        onboardingService = mock(StudentAcademicOnboardingService.class);
        leaveRequestRepository = mock(StudentLeaveRequestRepository.class);
        parentRepository = mock(ParentRepository.class);
        studentRepository = mock(StudentRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);

        academicController = new AcademicController(
                academicService,
                studentProfileService,
                onboardingService,
                leaveRequestRepository,
                parentRepository
        );
        academicController.setOptionalRepositories(studentRepository, auditLogRepository);
    }

    @Test
    void studentCannotAccessAnotherStudentMarks_IDOR_Protection() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student selfProfile = Student.builder().id(100L).user(studentUser).build();
        when(studentProfileService.getByUserId(10L)).thenReturn(selfProfile);
        when(studentProfileService.getByStudentId(101L)).thenReturn(Student.builder().id(101L).build());

        assertThrows(AccessDeniedException.class, () -> {
            academicController.getStudentMarks(101L, null, null);
        });

        verify(academicService, never()).getStudentMarks(101L);
    }

    @Test
    void studentCanAccessOwnMarksSuccessfully() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student selfProfile = Student.builder().id(100L).user(studentUser).build();
        when(studentProfileService.getByUserId(10L)).thenReturn(selfProfile);
        when(studentProfileService.getByStudentId(100L)).thenReturn(selfProfile);
        when(academicService.getStudentMarks(100L)).thenReturn(List.of(new Marks()));

        var response = academicController.getStudentMarks(100L, null, null);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void parentCanAccessOwnWardMarks() {
        Role parentRole = Role.builder().roleName(Role.UserRole.PARENT).build();
        User parentUser = User.builder().userId(50L).username("parent.wardA").role(parentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(parentUser, null, parentUser.getAuthorities())
        );

        Student ward = Student.builder().id(100L).registerNo("2117240020044").build();
        Parent parent = Parent.builder().id(1L).user(parentUser).student(ward).build();

        when(parentRepository.findByUser_Id(50L)).thenReturn(Optional.of(parent));
        when(academicService.getStudentMarks(100L)).thenReturn(List.of(new Marks()));

        var response = academicController.getStudentMarks(100L, null, null);
        assertEquals(200, response.getStatusCode().value());
        verify(academicService, times(1)).getStudentMarks(100L);
    }

    @Test
    void parentCannotAccessUnrelatedStudentMarks_IDOR_Protection() {
        Role parentRole = Role.builder().roleName(Role.UserRole.PARENT).build();
        User parentUser = User.builder().userId(50L).username("parent.wardA").role(parentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(parentUser, null, parentUser.getAuthorities())
        );

        Student wardA = Student.builder().id(100L).registerNo("2117240020044").build();
        Parent parent = Parent.builder().id(1L).user(parentUser).student(wardA).build();

        when(parentRepository.findByUser_Id(50L)).thenReturn(Optional.of(parent));

        // Parent attempts to access Student 999 (Ward B)
        assertThrows(AccessDeniedException.class, () -> {
            academicController.getStudentMarks(999L, null, null);
        });

        verify(academicService, never()).getStudentMarks(999L);
    }

    @Test
    void facultyCannotAccessStudentOfAnotherDepartment() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        Department cseDept = Department.builder().id(1L).deptName("CSE").build();
        Department eceDept = Department.builder().id(2L).deptName("ECE").build();

        User facultyUser = User.builder().userId(20L).username("faculty.cse").department(cseDept).role(facultyRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyUser, null, facultyUser.getAuthorities())
        );

        Student eceStudent = Student.builder().id(200L).department(eceDept).build();
        when(studentProfileService.getByStudentId(200L)).thenReturn(eceStudent);

        assertThrows(AccessDeniedException.class, () -> {
            academicController.getStudentMarks(200L, null, null);
        });

        verify(academicService, never()).getStudentMarks(200L);
    }

    @Test
    void facultyCannotProcessLeaveForStudentInAnotherDepartment() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        Department cseDept = Department.builder().id(1L).deptName("CSE").build();
        Department eceDept = Department.builder().id(2L).deptName("ECE").build();

        User facultyUser = User.builder().userId(20L).username("faculty.cse").department(cseDept).role(facultyRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyUser, null, facultyUser.getAuthorities())
        );

        StudentLeaveRequest leave = StudentLeaveRequest.builder()
                .id(15L)
                .studentId("2117240080001")
                .status("PENDING")
                .build();
        when(leaveRequestRepository.findById(15L)).thenReturn(Optional.of(leave));

        Student eceStudent = Student.builder().id(200L).department(eceDept).registerNo("2117240080001").build();
        when(studentRepository.findByRegisterNo("2117240080001")).thenReturn(Optional.of(eceStudent));

        assertThrows(AccessDeniedException.class, () -> {
            academicController.updateStudentLeaveStatus(15L, Map.of("status", "APPROVED"));
        });
    }

    @Test
    void applyLeave_RejectsInvalidRequestType() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        StudentLeaveRequest invalid = StudentLeaveRequest.builder()
                .type("VACATION")
                .build();

        assertThrows(ErpException.InvalidOperationException.class, () -> {
            academicController.applyLeave(invalid);
        });
    }

    @Test
    void leaveWorkflow_RejectsInvalidTransitions() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        Department cseDept = Department.builder().id(1L).deptName("CSE").build();
        User facultyUser = User.builder().userId(20L).username("faculty.coordinator").department(cseDept).role(facultyRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyUser, null, facultyUser.getAuthorities())
        );

        StudentLeaveRequest approvedLeave = StudentLeaveRequest.builder()
                .id(1L)
                .studentId("2117240020044")
                .status("APPROVED")
                .build();
        when(leaveRequestRepository.findById(1L)).thenReturn(Optional.of(approvedLeave));

        Student cseStudent = Student.builder().id(100L).department(cseDept).registerNo("2117240020044").build();
        when(studentRepository.findByRegisterNo("2117240020044")).thenReturn(Optional.of(cseStudent));

        // Transition from APPROVED back to PENDING must be rejected with InvalidOperationException
        assertThrows(ErpException.InvalidOperationException.class, () -> {
            academicController.updateStudentLeaveStatus(1L, Map.of("status", "PENDING"));
        });
    }

    @Test
    void leaveWorkflow_RejectsFacultyWithoutDepartment() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        User facultyNoDept = User.builder().userId(20L).username("faculty.nodept").role(facultyRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyNoDept, null, facultyNoDept.getAuthorities())
        );

        StudentLeaveRequest pendingLeave = StudentLeaveRequest.builder()
                .id(1L)
                .studentId("2117240020044")
                .status("PENDING")
                .build();
        when(leaveRequestRepository.findById(1L)).thenReturn(Optional.of(pendingLeave));

        // Faculty without department must be denied access (Fail-closed)
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> {
            academicController.updateStudentLeaveStatus(1L, Map.of("status", "APPROVED"));
        });
    }

    @Test
    void leaveWorkflow_ApprovesValidTransitionAndRecordsAuditing() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        Department cseDept = Department.builder().id(1L).deptName("CSE").build();
        User facultyUser = User.builder().userId(20L).username("faculty.coordinator").department(cseDept).role(facultyRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyUser, null, facultyUser.getAuthorities())
        );

        StudentLeaveRequest pendingLeave = StudentLeaveRequest.builder()
                .id(2L)
                .studentId("2117240020044")
                .status("PENDING")
                .build();
        when(leaveRequestRepository.findById(2L)).thenReturn(Optional.of(pendingLeave));
        when(leaveRequestRepository.save(any(StudentLeaveRequest.class))).thenAnswer(i -> i.getArgument(0));

        Student cseStudent = Student.builder().id(100L).department(cseDept).registerNo("2117240020044").build();
        when(studentRepository.findByRegisterNo("2117240020044")).thenReturn(Optional.of(cseStudent));

        ResponseEntity<StudentLeaveRequest> response = academicController.updateStudentLeaveStatus(
                2L, Map.of("status", "APPROVED", "remarks", "Approved by advisor")
        );

        assertEquals(200, response.getStatusCode().value());
        StudentLeaveRequest saved = response.getBody();
        assertNotNull(saved);
        assertEquals("APPROVED", saved.getStatus());
        assertEquals("faculty.coordinator", saved.getApprovedBy());
        assertNotNull(saved.getApprovedAt());
        assertNull(saved.getRejectedAt());
        assertEquals("Approved by advisor", saved.getRemarks());
    }
}
