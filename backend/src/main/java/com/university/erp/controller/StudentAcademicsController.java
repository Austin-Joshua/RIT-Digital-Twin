package com.university.erp.controller;

import com.university.erp.entity.User;
import com.university.erp.service.StudentAcademicOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/api/student", "/api/students/academics" })
@RequiredArgsConstructor
public class StudentAcademicsController {

    private final StudentAcademicOnboardingService onboardingService;

    @GetMapping("/dashboard-summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> dashboardSummary() {
        return ResponseEntity.ok(onboardingService.getStudentDashboardData(currentUser().getId()));
    }

    @GetMapping("/gradebook")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> gradebook(
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(onboardingService.getGradebook(currentUser().getId(), semester));
    }

    @GetMapping("/cgpa")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> cgpa() {
        return ResponseEntity.ok(onboardingService.getSemGpa(currentUser().getId()));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
