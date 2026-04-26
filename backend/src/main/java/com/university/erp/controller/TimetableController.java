package com.university.erp.controller;

import com.university.erp.dto.TimetableGenerateRequest;
import com.university.erp.dto.TimetableGeneratorAccessDto;
import com.university.erp.dto.TimetableGenerationResponseDto;
import com.university.erp.dto.TimetableSlotViewDto;
import com.university.erp.dto.TimetablePrintReadyReportDto;
import com.university.erp.model.User;
import com.university.erp.service.TimetableService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/academic", "/api/academics" })
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @GetMapping("/student/timetable")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TimetableSlotViewDto>> getStudentTimetable(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(timetableService.getStudentTimetableView(currentUser.getId()));
    }

    @GetMapping("/faculty/timetable")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<TimetableSlotViewDto>> getFacultyTimetable(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(timetableService.getFacultyTimetableView(currentUser.getId()));
    }

    @GetMapping("/admin/timetable")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<TimetableSlotViewDto>> getAdminTimetable(
            @RequestParam Long deptId,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(timetableService.getAdminTimetableView(deptId, section));
    }

    @PostMapping("/timetable/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<TimetableGenerationResponseDto> generateTimetable(
            @RequestBody TimetableGenerateRequest request,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(timetableService.generateWeeklyTimetable(request, currentUser));
    }

    @GetMapping("/timetable/generate-access")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<TimetableGeneratorAccessDto> getTimetableGenerateAccess(
            Authentication authentication,
            @RequestParam(required = false) Integer semesterNumber) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(timetableService.getTimetableGeneratorAccess(currentUser, semesterNumber));
    }

    @GetMapping("/timetable/sections")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<List<String>> getTimetableSections(
            Authentication authentication,
            @RequestParam(required = false) Integer semesterNumber) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(timetableService.getAvailableSectionsForGeneration(currentUser, semesterNumber));
    }

    @GetMapping("/timetable/print-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<TimetablePrintReadyReportDto> getPrintReadyTimetableReport(
            @RequestParam Long deptId,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(timetableService.getPrintReadyTimetableReport(deptId, section));
    }

    @PostMapping("/timetable/export-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<byte[]> exportTimetablePdf(
            @RequestBody TimetableGenerateRequest request,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        byte[] pdf = timetableService.exportTimetablePdf(request, currentUser);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"department-timetable.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
