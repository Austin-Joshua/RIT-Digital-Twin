package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.service.AcademicService;
import com.rit.digitaltwin.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/academic/leave")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class LeaveController {

    private final LeaveService leaveService;
    private final AcademicService academicService;

    // --- Student Endpoints ---

    @PostMapping("/apply-leave")
    public ResponseEntity<LeaveApplication> applyLeave(@RequestParam String start,
            @RequestParam String end,
            @RequestParam String reason,
            @RequestParam(required = false) String docUrl,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Student student = academicService.getStudentByUserId(user.getUserId());
        return ResponseEntity.ok(
                leaveService.applyLeave(student.getId(), LocalDate.parse(start), LocalDate.parse(end), reason, docUrl));
    }

    @PostMapping("/apply-od")
    public ResponseEntity<ODApplication> applyOD(@RequestParam String date,
            @RequestParam String eventName,
            @RequestParam String reason,
            @RequestParam(required = false) String docUrl,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Student student = academicService.getStudentByUserId(user.getUserId());
        return ResponseEntity
                .ok(leaveService.applyOD(student.getId(), LocalDate.parse(date), eventName, reason, docUrl));
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<List<LeaveApplication>> getMyLeaves(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Student student = academicService.getStudentByUserId(user.getUserId());
        return ResponseEntity.ok(leaveService.getStudentLeaves(student.getId()));
    }

    @GetMapping("/my-ods")
    public ResponseEntity<List<ODApplication>> getMyODs(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Student student = academicService.getStudentByUserId(user.getUserId());
        return ResponseEntity.ok(leaveService.getStudentODs(student.getId()));
    }

    // --- Faculty Endpoints ---

    @GetMapping("/pending-leaves")
    public ResponseEntity<List<LeaveApplication>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @GetMapping("/pending-ods")
    public ResponseEntity<List<ODApplication>> getPendingODs() {
        return ResponseEntity.ok(leaveService.getPendingODs());
    }

    @PostMapping("/review-leave/{leaveId}")
    public ResponseEntity<LeaveApplication> reviewLeave(@PathVariable Long leaveId,
            @RequestParam String status,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Faculty faculty = academicService.getFacultyByUserId(user.getUserId());
        return ResponseEntity.ok(leaveService.reviewLeave(leaveId, faculty.getId(), status));
    }

    @PostMapping("/review-od/{odId}")
    public ResponseEntity<ODApplication> reviewOD(@PathVariable Long odId,
            @RequestParam String status,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Faculty faculty = academicService.getFacultyByUserId(user.getUserId());
        return ResponseEntity.ok(leaveService.reviewOD(odId, faculty.getId(), status));
    }
}
