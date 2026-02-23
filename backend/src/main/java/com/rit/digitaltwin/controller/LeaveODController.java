package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.LeaveApplication;
import com.rit.digitaltwin.model.ODApplication;
import com.rit.digitaltwin.service.LeaveODService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/academic/workflow")
@RequiredArgsConstructor
public class LeaveODController {

    private final LeaveODService leaveODService;

    @PostMapping("/leave/apply")
    public ResponseEntity<LeaveApplication> applyLeave(@RequestBody LeaveApplication leave) {
        return ResponseEntity.ok(leaveODService.applyLeave(leave));
    }

    @PostMapping("/leave/status")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<LeaveApplication> updateLeaveStatus(
            @RequestParam Long leaveId,
            @RequestParam String status,
            @RequestParam Long facultyId) {
        return ResponseEntity.ok(leaveODService.updateLeaveStatus(leaveId, status, facultyId));
    }

    @PostMapping("/od/apply")
    public ResponseEntity<ODApplication> applyOD(@RequestBody ODApplication od) {
        return ResponseEntity.ok(leaveODService.applyOD(od));
    }

    @GetMapping("/student/{studentId}/leaves")
    public ResponseEntity<List<LeaveApplication>> getStudentLeaves(@PathVariable Long studentId) {
        return ResponseEntity.ok(leaveODService.getStudentLeaves(studentId));
    }
}
