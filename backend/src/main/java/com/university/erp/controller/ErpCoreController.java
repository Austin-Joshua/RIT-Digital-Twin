package com.university.erp.controller;

import com.university.erp.model.Curriculum;
import com.university.erp.model.Subject;
import com.university.erp.model.User;
import com.university.erp.service.ErpCoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/api/erp", "/api/academics/core" })
@RequiredArgsConstructor
public class ErpCoreController {

    private final ErpCoreService erpCoreService;

    @GetMapping("/curriculum")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<List<Curriculum>> curriculum() {
        return ResponseEntity.ok(erpCoreService.listCurricula());
    }

    @PostMapping("/curriculum")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Curriculum> upsertCurriculum(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(erpCoreService.upsertCurriculum(payload));
    }

    @PostMapping("/faculty-subjects")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<?> assignFacultySubject(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(erpCoreService.assignFacultySubject(payload, currentUser().getId()));
    }

    @PostMapping("/faculty-subjects/preferences")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<?> submitFacultyPreference(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(erpCoreService.submitFacultySubjectPreference(payload, currentUser().getId()));
    }

    @GetMapping("/faculty-subjects/preferences/pending")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<List<Map<String, Object>>> getPendingFacultyPreferences(@RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(erpCoreService.getPendingFacultySubjectPreferences(departmentId));
    }

    @PostMapping("/faculty-subjects/{facultySubjectId}/review")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<?> reviewFacultyPreference(@PathVariable Long facultySubjectId, @RequestParam boolean approved) {
        return ResponseEntity.ok(erpCoreService.reviewFacultySubjectPreference(facultySubjectId, approved, currentUser().getId()));
    }

    @PostMapping("/students/{studentId}/assign-subjects")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<Map<String, Object>> assignStudentSubjects(@PathVariable Long studentId,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(erpCoreService.assignSubjectsToStudent(studentId, semester));
    }

    @PostMapping("/promote")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<Map<String, Object>> promoteSection(@RequestParam String section) {
        return ResponseEntity.ok(erpCoreService.promoteSection(section));
    }

    @GetMapping("/faculty/assignments")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<Map<String, Object>>> facultyAssignments() {
        return ResponseEntity.ok(erpCoreService.facultyAssignments(currentUser().getId()));
    }

    @GetMapping("/faculty/roster")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<Map<String, Object>>> facultyRoster(@RequestParam Long subjectId,
            @RequestParam Integer semester, @RequestParam String section) {
        return ResponseEntity.ok(erpCoreService.facultyRoster(currentUser().getId(), subjectId, semester, section));
    }

    @PostMapping("/faculty/attendance")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Map<String, Object>> submitAttendance(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(erpCoreService.submitAttendance(currentUser().getId(), payload));
    }

    @PostMapping("/faculty/internal-marks")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Map<String, Object>> upsertInternalMarks(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(erpCoreService.upsertInternalMark(currentUser().getId(), payload));
    }

    @PostMapping("/faculty/publish-grade")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<Map<String, Object>> publishGrade(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(erpCoreService.publishGrade(payload));
    }

    @GetMapping("/student/subjects")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Subject>> studentSubjects() {
        return ResponseEntity.ok(erpCoreService.currentSubjects(currentUser().getId()));
    }

    @GetMapping("/student/attendance-summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> studentAttendanceSummary() {
        return ResponseEntity.ok(erpCoreService.attendanceSummaryForStudent(currentUser().getId()));
    }

    @GetMapping("/student/internal-marks")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> studentInternalMarks() {
        return ResponseEntity.ok(erpCoreService.internalMarksForStudent(currentUser().getId()));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
