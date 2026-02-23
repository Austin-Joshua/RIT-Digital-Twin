package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.DepartmentAnalyticsDTO;
import com.rit.digitaltwin.dto.FacultyPerformanceDTO;
import com.rit.digitaltwin.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/departments")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<DepartmentAnalyticsDTO>> getDepartmentAnalytics() {
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics());
    }

    @GetMapping("/faculty-performance")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<FacultyPerformanceDTO>> getFacultyPerformance() {
        return ResponseEntity.ok(analyticsService.getFacultyPerformanceIndex());
    }
}
