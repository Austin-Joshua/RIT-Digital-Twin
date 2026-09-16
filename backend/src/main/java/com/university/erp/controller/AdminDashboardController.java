package com.university.erp.controller;

import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final StudentRepository studentRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final UserRepository userRepository;
    private final StudentLeaveRequestRepository studentLeaveRequestRepository;
    private final FacultyLeaveRequestRepository facultyLeaveRequestRepository;
    private final PlacementApplicationRepository placementApplicationRepository;

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyProfileRepository.count();
        long totalUsers = userRepository.count();
        
        long pendingStudentLeaves = studentLeaveRequestRepository.findAll().stream()
                .filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();
        long pendingFacultyLeaves = facultyLeaveRequestRepository.findAll().stream()
                .filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();
        long pendingApprovals = pendingStudentLeaves + pendingFacultyLeaves;

        long placedStudents = placementApplicationRepository.countByStatus("ACCEPTED");
        long totalApplicants = placementApplicationRepository.count();
        double placementRate = totalApplicants > 0 ? (placedStudents * 100.0 / totalApplicants) : 0.0;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("totalStudents", totalStudents);
        body.put("totalFaculty", totalFaculty);
        body.put("activeUsers", totalUsers);
        body.put("placementRate", Math.round(placementRate * 10.0) / 10.0);
        body.put("activeResearch", 0);
        body.put("pendingApprovals", pendingApprovals);

        List<AuditLog> realLogs = auditLogRepository.findAll().stream()
                .sorted((a, b) -> b.getActionTime().compareTo(a.getActionTime()))
                .limit(10)
                .toList();

        List<Map<String, Object>> auditLogList = new ArrayList<>();
        for (AuditLog log : realLogs) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("event", log.getAction());
            map.put("user", log.getActor() != null ? log.getActor().getUsername() : "System");
            map.put("timestamp", log.getActionTime() != null ? log.getActionTime().toString() : new Date().toString());
            map.put("details", log.getDetails() != null ? log.getDetails() : "Action performed");
            auditLogList.add(map);
        }

        body.put("auditLogs", auditLogList);

        return ResponseEntity.ok(body);
    }
}
