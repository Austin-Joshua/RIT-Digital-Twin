package com.university.erp.controller;

import com.university.erp.model.TimetableSlot;
import com.university.erp.model.User;
import com.university.erp.service.TimetableService;
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
    public ResponseEntity<List<TimetableSlot>> getStudentTimetable(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(timetableService.getStudentTimetable(currentUser.getId()));
    }

    @GetMapping("/faculty/timetable")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<TimetableSlot>> getFacultyTimetable(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(timetableService.getFacultyTimetable(currentUser.getId()));
    }

    @PostMapping("/timetable/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<List<TimetableSlot>> generateTimetable(
            @RequestParam Long deptId,
            @RequestParam String section) {
        return ResponseEntity.ok(timetableService.generateWeeklyTimetable(deptId, section));
    }
}
