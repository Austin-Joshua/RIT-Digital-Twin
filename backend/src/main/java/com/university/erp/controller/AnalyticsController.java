package com.university.erp.controller;

import com.university.erp.entity.AttendanceRisk;
import com.university.erp.entity.PerformanceWarning;
import com.university.erp.service.AttendanceAnalyticsService;
import com.university.erp.service.StudentSuccessService;
import com.university.erp.repository.AttendanceRiskRepository;
import com.university.erp.repository.PerformanceWarningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AttendanceAnalyticsService attendanceAnalyticsService;
    private final StudentSuccessService studentSuccessService;
    private final AttendanceRiskRepository attendanceRiskRepository;
    private final PerformanceWarningRepository performanceWarningRepository;
    private final com.university.erp.service.HODService hodService;
    private final com.university.erp.repository.DepartmentRepository departmentRepository;

    @PostMapping("/run")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<?> runAnalytics() {
        attendanceAnalyticsService.runAttendanceAnalysisForAllStudents();
        studentSuccessService.runPerformanceAnalysisForAllStudents();
        return ResponseEntity.ok(Map.of("message", "Analytics run successfully"));
    }

    @GetMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentAnalytics() {
        return ResponseEntity.ok(departmentRepository.findAll().stream()
                .map(d -> hodService.getDepartmentAnalytics(d.getId()))
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/faculty-performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getFacultyPerformance() {
        // Sample implementation: return faculty stats for first department for now
        // In a real system, we'd aggregate across all.
        Long firstDeptId = departmentRepository.findAll().stream().findFirst().map(d -> d.getId()).orElse(1L);
        return ResponseEntity.ok(hodService.getFaculty(firstDeptId));
    }

    @GetMapping("/student/{studentId}/risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY', 'PARENT')")
    public ResponseEntity<?> getStudentRisk(@PathVariable Long studentId) {
        List<AttendanceRisk> attendanceRisks = attendanceRiskRepository.findByStudent_IdOrderByAnalyzedAtDesc(studentId);
        List<PerformanceWarning> performanceWarnings = performanceWarningRepository.findByStudent_IdOrderByAnalyzedAtDesc(studentId);
        
        return ResponseEntity.ok(Map.of(
                "attendanceRisk", attendanceRisks.isEmpty() ? null : attendanceRisks.get(0),
                "performanceWarning", performanceWarnings.isEmpty() ? null : performanceWarnings.get(0)
        ));
    }
}
