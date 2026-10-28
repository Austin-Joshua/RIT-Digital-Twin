package com.university.erp.controller;

import com.university.erp.dto.CseAStudentImportDto;
import com.university.erp.service.StudentAcademicOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importStudents(
            @RequestParam(required = false, defaultValue = "CSE") String departmentCode,
            @RequestParam(required = false, defaultValue = "CSE-A") String section,
            @RequestParam(required = false, defaultValue = "2024-2028") String batch,
            @RequestParam(required = false, defaultValue = "2024-2025") String academicYear,
            @RequestBody List<CseAStudentImportDto> payload) {
        return ResponseEntity.ok(onboardingService.importStudents(departmentCode, section, batch, academicYear, payload));
    }

    @PostMapping("/import-cse-a")
    public ResponseEntity<Map<String, Object>> importCseA(@RequestBody List<CseAStudentImportDto> payload) {
        return ResponseEntity.ok(onboardingService.importCseAStudents(payload));
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null) {
            int pageSize = (size != null && size > 0 && size <= 200) ? size : 20;
            Pageable pageable = PageRequest.of(page, pageSize, Sort.by("id").ascending());
            return ResponseEntity.ok(onboardingService.listStudentsPaginated(section, department, pageable));
        }
        String targetSection = (section == null || section.isBlank()) ? "CSE-A" : section;
        return ResponseEntity.ok(onboardingService.listStudentsBySection(targetSection));
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(onboardingService.updateStudent(studentId, payload));
    }

    @PostMapping("/{studentId}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long studentId) {
        String temporaryPassword = onboardingService.resetStudentPassword(studentId);
        return ResponseEntity.ok(Map.of(
                "message", "Temporary password issued once. The user must change it at next login.",
                "temporaryPassword", temporaryPassword));
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
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students-" + section + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.toString());
    }

    private String q(Object val) {
        if (val == null) return "\"\"";
        return "\"" + String.valueOf(val).replace("\"", "\"\"") + "\"";
    }
}
