package com.university.erp.controller;

import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.service.HODService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hod")
@PreAuthorize("hasRole('HOD')")
@RequiredArgsConstructor
public class HODController {

    private final HODService hodService;

    private Long getHodDepartmentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            throw new AccessDeniedException("HOD access only.");
        }
        User user = (User) auth.getPrincipal();
        if (user.getRole() == null || user.getRole().getRoleName() != Role.UserRole.HOD) {
            throw new AccessDeniedException("HOD access only.");
        }
        if (user.getDepartment() == null || user.getDepartment().getId() == null) {
            throw new AccessDeniedException("HOD must be assigned to a department.");
        }
        return user.getDepartment().getId();
    }

    @GetMapping("/department-stats")
    public ResponseEntity<Map<String, Object>> getDepartmentStats() {
        return ResponseEntity.ok(hodService.getDepartmentStats(getHodDepartmentId()));
    }

    @GetMapping("/department-analytics")
    public ResponseEntity<Map<String, Object>> getDepartmentAnalytics() {
        return ResponseEntity.ok(hodService.getDepartmentAnalytics(getHodDepartmentId()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(hodService.getStudents(getHodDepartmentId(), year, section));
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<Map<String, Object>>> getFaculty() {
        return ResponseEntity.ok(hodService.getFaculty(getHodDepartmentId()));
    }

    @GetMapping("/class-performance")
    public ResponseEntity<List<Map<String, Object>>> getClassPerformance(
            @RequestParam(required = false, defaultValue = "highest") String sortBy) {
        return ResponseEntity.ok(hodService.getClassPerformance(getHodDepartmentId(), sortBy));
    }

    @GetMapping("/student-performance/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentPerformance(@PathVariable Long studentId) {
        return ResponseEntity.ok(hodService.getStudentPerformance(getHodDepartmentId(), studentId));
    }

    @GetMapping("/subject-heatmap")
    public ResponseEntity<List<Map<String, Object>>> getSubjectHeatmap() {
        return ResponseEntity.ok(hodService.getSubjectHeatmap(getHodDepartmentId()));
    }

    @GetMapping("/weak-subjects")
    public ResponseEntity<List<Map<String, Object>>> getWeakSubjects(
            @RequestParam(required = false) BigDecimal avgThreshold,
            @RequestParam(required = false) Double failureRateThreshold) {
        return ResponseEntity.ok(hodService.getWeakSubjects(getHodDepartmentId(), avgThreshold, failureRateThreshold));
    }

    @GetMapping("/performance-trends")
    public ResponseEntity<List<Map<String, Object>>> getPerformanceTrends(
            @RequestParam(required = false, defaultValue = "semester") String by) {
        return ResponseEntity.ok(hodService.getPerformanceTrends(getHodDepartmentId(), by));
    }

    @GetMapping("/class-rankings")
    public ResponseEntity<List<Map<String, Object>>> getClassRankings() {
        return ResponseEntity.ok(hodService.getClassRankings(getHodDepartmentId()));
    }
}
