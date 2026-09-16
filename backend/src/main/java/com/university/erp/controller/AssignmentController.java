package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.util.ErpException;
import com.university.erp.util.FileUploadSecurityValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments() {
        User user = currentUser();
        Student student = studentRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));

        // Scope to student's enrolled subjects
        List<StudentSubject> enrollments = studentSubjectRepository
                .findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(student.getId());

        List<Long> subjectIds = enrollments.stream()
                .filter(e -> e.getSubject() != null)
                .map(e -> e.getSubject().getId())
                .distinct()
                .toList();

        if (subjectIds.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Assignment> eligibleAssignments = assignmentRepository.findBySubject_IdIn(subjectIds);
        List<AssignmentSubmission> mySubmissions = submissionRepository.findByStudent_Id(student.getId());
        Map<Long, AssignmentSubmission> subMap = new HashMap<>();
        for (AssignmentSubmission sub : mySubmissions) {
            subMap.put(sub.getAssignment().getId(), sub);
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (Assignment a : eligibleAssignments) {
            AssignmentSubmission sub = subMap.get(a.getId());
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("assignmentId", a.getId());
            map.put("code", a.getSubject() != null ? a.getSubject().getSubjectCode() : "N/A");
            map.put("name", a.getSubject() != null ? a.getSubject().getSubjectName() : a.getTitle());
            map.put("faculty", a.getFaculty() != null ? (a.getFaculty().getFirstName() + " " + a.getFaculty().getLastName()) : "Faculty Coordinator");
            map.put("deadline", a.getDeadline() != null ? a.getDeadline().toString() : null);
            map.put("maxMarks", a.getMaxMarks());
            map.put("status", sub != null ? sub.getStatus() : "Pending");
            map.put("file", sub != null ? sub.getFileName() : null);
            map.put("score", sub != null ? sub.getScore() : null);
            map.put("feedback", sub != null ? sub.getFeedback() : null);
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public ResponseEntity<Map<String, Object>> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, Object> payload) {
        User user = currentUser();
        Student student = studentRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Assignment not found"));

        // Verify student is enrolled in the assignment's subject
        if (assignment.getSubject() != null) {
            List<StudentSubject> enrollments = studentSubjectRepository
                    .findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(student.getId());
            boolean enrolled = enrollments.stream().anyMatch(e ->
                    e.getSubject() != null && e.getSubject().getId().equals(assignment.getSubject().getId()));
            if (!enrolled) {
                throw new ErpException.UnauthorizedException("Student is not enrolled in the subject for this assignment.");
            }
        }

        String rawFileName = (String) payload.getOrDefault("fileName", "Submission.pdf");
        String safeFileName = FileUploadSecurityValidator.sanitizeAndValidateFileName(rawFileName);

        AssignmentSubmission submission = submissionRepository.findByAssignment_IdAndStudent_Id(assignmentId, student.getId())
                .orElseGet(() -> AssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        submission.setFileName(safeFileName);
        submission.setStatus("SUBMITTED");
        submission.setSubmissionTimestamp(LocalDateTime.now());
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Assignment submitted successfully.",
                "assignmentId", assignmentId,
                "status", "SUBMITTED"
        ));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','HOD')")
    public ResponseEntity<List<Map<String, Object>>> getFacultySubmissions() {
        User user = currentUser();
        Role.UserRole role = user.getRole() != null ? user.getRole().getRoleName() : null;
        boolean isAdmin = role == Role.UserRole.ADMIN;
        boolean isHod = role == Role.UserRole.HOD;

        List<AssignmentSubmission> submissions;
        if (isAdmin) {
            submissions = submissionRepository.findAll();
        } else if (isHod) {
            Optional<FacultyProfile> profile = facultyProfileRepository.findByUser_Id(user.getId());
            if (profile.isPresent() && profile.get().getDepartment() != null) {
                submissions = submissionRepository.findByAssignment_Subject_Department_DepartmentNameIgnoreCase(profile.get().getDepartment());
            } else {
                submissions = submissionRepository.findByAssignment_Faculty_Id(user.getId());
            }
        } else {
            // Standard Faculty: strictly scoped to assignments they coordinate
            submissions = submissionRepository.findByAssignment_Faculty_Id(user.getId());
        }

        List<Map<String, Object>> out = new ArrayList<>();
        for (AssignmentSubmission s : submissions) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("assignmentId", s.getAssignment().getId());
            map.put("subjectCode", s.getAssignment().getSubject() != null ? s.getAssignment().getSubject().getSubjectCode() : "");
            map.put("student", s.getStudent() != null ? s.getStudent().getStudentName() : "Student");
            map.put("reg", s.getStudent() != null ? s.getStudent().getRegisterNo() : "");
            map.put("submittedAt", s.getSubmissionTimestamp() != null ? s.getSubmissionTimestamp().toString() : null);
            map.put("status", s.getStatus() != null ? s.getStatus() : "SUBMITTED");
            map.put("file", s.getFileName() != null ? s.getFileName() : null);
            map.put("score", s.getScore() != null ? s.getScore() : null);
            map.put("feedback", s.getFeedback() != null ? s.getFeedback() : null);
            out.add(map);
        }
        return ResponseEntity.ok(out);
    }

    @PostMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','HOD')")
    @Transactional
    public ResponseEntity<Map<String, Object>> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> payload) {
        User user = currentUser();
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Submission not found"));

        Role.UserRole role = user.getRole() != null ? user.getRole().getRoleName() : null;
        boolean isAdmin = role == Role.UserRole.ADMIN;
        boolean isHod = role == Role.UserRole.HOD;

        // Faculty resource-level authorization
        if (!isAdmin && !isHod) {
            if (submission.getAssignment().getFaculty() == null ||
                    !submission.getAssignment().getFaculty().getId().equals(user.getId())) {
                throw new ErpException.UnauthorizedException("Access Denied: You are not authorized to grade this assignment submission.");
            }
        }

        // Validate score
        Object scoreObj = payload.get("score");
        if (scoreObj == null) {
            throw new ErpException.BadRequestException("Score is required for grading.");
        }

        BigDecimal score;
        try {
            score = new BigDecimal(String.valueOf(scoreObj));
        } catch (NumberFormatException e) {
            throw new ErpException.BadRequestException("Invalid numeric score format: " + scoreObj);
        }

        if (score.compareTo(BigDecimal.ZERO) < 0) {
            throw new ErpException.BadRequestException("Score cannot be negative.");
        }

        Integer maxMarks = submission.getAssignment().getMaxMarks() != null ? submission.getAssignment().getMaxMarks() : 100;
        if (score.compareTo(new BigDecimal(maxMarks)) > 0) {
            throw new ErpException.BadRequestException("Score (" + score + ") exceeds maximum marks (" + maxMarks + ").");
        }

        String feedback = payload.get("feedback") != null ? String.valueOf(payload.get("feedback")) : null;

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setStatus("GRADED");
        submission.setGradedBy(user);
        submission.setGradedAt(LocalDateTime.now());
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Submission graded successfully",
                "submissionId", submissionId,
                "score", score
        ));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
