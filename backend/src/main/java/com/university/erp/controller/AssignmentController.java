package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.util.ErpException;
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

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments() {
        User user = currentUser();
        Student student = studentRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));

        List<Assignment> allAssignments = assignmentRepository.findAll();
        List<AssignmentSubmission> mySubmissions = submissionRepository.findByStudent_Id(student.getId());
        Map<Long, AssignmentSubmission> subMap = new HashMap<>();
        for (AssignmentSubmission sub : mySubmissions) {
            subMap.put(sub.getAssignment().getId(), sub);
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (Assignment a : allAssignments) {
            AssignmentSubmission sub = subMap.get(a.getId());
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("assignmentId", a.getId());
            map.put("code", a.getSubject() != null ? a.getSubject().getSubjectCode() : "N/A");
            map.put("name", a.getSubject() != null ? a.getSubject().getSubjectName() : a.getTitle());
            map.put("faculty", a.getFaculty() != null ? (a.getFaculty().getFirstName() + " " + a.getFaculty().getLastName()) : "Faculty Coordinator");
            map.put("deadline", a.getDeadline() != null ? a.getDeadline().toString() : "2026-09-30");
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

        String fileName = (String) payload.getOrDefault("fileName", assignment.getSubject().getSubjectCode() + "_Submission.pdf");

        AssignmentSubmission submission = submissionRepository.findByAssignment_IdAndStudent_Id(assignmentId, student.getId())
                .orElseGet(() -> AssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        submission.setFileName(fileName);
        submission.setStatus("Submitted");
        submission.setSubmissionTimestamp(LocalDateTime.now());
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Assignment submitted successfully.",
                "assignmentId", assignmentId,
                "status", "Submitted"
        ));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','HOD')")
    public ResponseEntity<List<Map<String, Object>>> getFacultySubmissions() {
        List<AssignmentSubmission> submissions = submissionRepository.findAll();
        List<Map<String, Object>> out = new ArrayList<>();
        for (AssignmentSubmission s : submissions) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("assignmentId", s.getAssignment().getId());
            map.put("subjectCode", s.getAssignment().getSubject() != null ? s.getAssignment().getSubject().getSubjectCode() : "");
            map.put("student", s.getStudent() != null ? s.getStudent().getStudentName() : "Student");
            map.put("reg", s.getStudent() != null ? s.getStudent().getRegisterNo() : "");
            map.put("submittedAt", s.getSubmissionTimestamp() != null ? s.getSubmissionTimestamp().toString() : "Just now");
            map.put("status", s.getStatus() != null ? s.getStatus().toLowerCase() : "pending");
            map.put("file", s.getFileName() != null ? s.getFileName() : "submission.pdf");
            map.put("score", s.getScore() != null ? s.getScore() : "");
            map.put("feedback", s.getFeedback() != null ? s.getFeedback() : "");
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
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Submission not found"));

        Object scoreObj = payload.get("score");
        BigDecimal score = scoreObj != null ? new BigDecimal(String.valueOf(scoreObj)) : BigDecimal.ZERO;
        String feedback = (String) payload.getOrDefault("feedback", "Good effort.");

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setStatus("Graded");
        submission.setGradedBy(currentUser());
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
