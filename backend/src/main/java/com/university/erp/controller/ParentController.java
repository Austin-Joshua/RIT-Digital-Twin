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

        Map<String, Object> studentInfo = new java.util.LinkedHashMap<>();
        studentInfo.put("name", student.getStudentName());
        studentInfo.put("registerNo", student.getRegisterNo());
        studentInfo.put("department", student.getDepartment() == null ? null : student.getDepartment().getDeptName());
        studentInfo.put("cgpa", student.getCurrentCgpa());
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("studentInfo", studentInfo);
        body.put("academics", internalMarks);
        body.put("attendance", attendance);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<List<Map<String, Object>>> getLinkedStudents(@AuthenticationPrincipal User user) {
        Student student = parentService.getAssignedStudent(user.getId());
        if (student == null) {
            return ResponseEntity.ok(List.of());
        }
        Map<String, Object> map = new java.util.LinkedHashMap<>();
        map.put("id", student.getId());
        map.put("studentName", student.getStudentName());
        map.put("registerNo", student.getRegisterNo());
        map.put("studentIdNumber", student.getStudentIdNumber());
        map.put("section", student.getSection());
        map.put("batch", student.getBatch());
        map.put("year", student.getYear());
        map.put("currentSemester", student.getCurrentSemester());
        map.put("currentCgpa", student.getCurrentCgpa());
        map.put("department", student.getDepartment() != null ? student.getDepartment().getDeptName() : null);
        return ResponseEntity.ok(List.of(map));
    }

    @GetMapping("/student/timetable")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<List<TimetableSlotViewDto>> getWardTimetable(@AuthenticationPrincipal User user) {
        Student student = parentService.getAssignedStudent(user.getId());
        Long studentUserId = student.getUser().getId();
        return ResponseEntity.ok(timetableService.getStudentTimetableView(studentUserId));
    }
}
