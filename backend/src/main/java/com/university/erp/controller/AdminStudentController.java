package com.university.erp.controller;

import com.university.erp.dto.CseAStudentImportDto;
import com.university.erp.service.StudentAcademicOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final StudentAcademicOnboardingService onboardingService;

    @PostMapping("/import-cse-a")
    public ResponseEntity<Map<String, Object>> importCseA(@RequestBody List<CseAStudentImportDto> payload) {
        return ResponseEntity.ok(onboardingService.importCseAStudents(payload));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestParam(required = false, defaultValue = "CSE-A") String section) {
        return ResponseEntity.ok(onboardingService.listStudentsBySection(section));
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(onboardingService.updateStudent(studentId, payload));
    }

    @PostMapping("/{studentId}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long studentId) {
        onboardingService.resetStudentPassword(studentId);
        return ResponseEntity.ok(Map.of("message", "Password reset to register number and force change enabled"));
    }

    @PostMapping("/{studentId}/rollback-last-change")
    public ResponseEntity<Map<String, Object>> rollbackLastChange(@PathVariable Long studentId) {
        return ResponseEntity.ok(onboardingService.rollbackStudentLastChange(studentId));
    }

    @GetMapping("/export")
    public ResponseEntity<String> export(
            @RequestParam(required = false, defaultValue = "CSE-A") String section) {
        List<Map<String, Object>> students = onboardingService.listStudentsBySection(section);
        StringBuilder csv = new StringBuilder("student_id,register_no,name,department,section,batch,scholar_type,email,phone,status,cgpa\n");
        for (Map<String, Object> s : students) {
            csv.append(s.get("studentId")).append(",")
                    .append(q(s.get("registerNo"))).append(",")
                    .append(q(s.get("name"))).append(",")
                    .append(q(s.get("department"))).append(",")
                    .append(q(s.get("section"))).append(",")
                    .append(q(s.get("batch"))).append(",")
                    .append(q(s.get("scholarType"))).append(",")
                    .append(q(s.get("email"))).append(",")
                    .append(q(s.get("phone"))).append(",")
                    .append(q(s.get("status"))).append(",")
                    .append(q(s.get("cgpa"))).append("\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students-" + section + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }

    @PostMapping("/repair-demo-links")
    public ResponseEntity<Map<String, Object>> repairDemoLinks() {
        return ResponseEntity.ok(onboardingService.repairDemoAcademicLinks());
    }

    private static String q(Object o) {
        String v = String.valueOf(o == null ? "" : o);
        return "\"" + v.replace("\"", "\"\"") + "\"";
    }
}
