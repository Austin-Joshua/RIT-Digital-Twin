package com.university.erp.controller;

import com.university.erp.model.Student;
import com.university.erp.model.User;
import com.university.erp.service.ParentService;
import com.university.erp.service.ErpCoreService;
import com.university.erp.service.TimetableService;
import com.university.erp.dto.TimetableSlotViewDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
public class ParentController {

    private final ParentService parentService;
    private final ErpCoreService erpCoreService;
    private final TimetableService timetableService;

    public ParentController(ParentService parentService, ErpCoreService erpCoreService, TimetableService timetableService) {
        this.parentService = parentService;
        this.erpCoreService = erpCoreService;
        this.timetableService = timetableService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getParentDashboard(@AuthenticationPrincipal User user) {
        Student student = parentService.getAssignedStudent(user.getId());
        Long studentUserId = student.getUser().getId();
        
        java.util.List<Map<String, Object>> internalMarks = erpCoreService.internalMarksForStudent(studentUserId);
        java.util.List<Map<String, Object>> attendance = erpCoreService.attendanceSummaryForStudent(studentUserId);

        return ResponseEntity.ok(Map.of(
                "studentInfo", Map.of(
                    "name", student.getStudentName(),
                    "registerNo", student.getRegisterNo(),
                    "department", student.getDepartment().getDeptName(),
                    "cgpa", student.getCurrentCgpa() != null ? student.getCurrentCgpa() : 0.0
                ),
                "academics", internalMarks,
                "attendance", attendance
        ));
    }

    @GetMapping("/student/timetable")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<List<TimetableSlotViewDto>> getWardTimetable(@AuthenticationPrincipal User user) {
        Student student = parentService.getAssignedStudent(user.getId());
        Long studentUserId = student.getUser().getId();
        return ResponseEntity.ok(timetableService.getStudentTimetableView(studentUserId));
    }
}
