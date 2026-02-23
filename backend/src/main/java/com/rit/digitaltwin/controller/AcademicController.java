package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.service.AcademicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/academic")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AcademicController {

    private final AcademicService academicService;

    // --- Faculty Endpoints ---

    @PostMapping("/faculty/marks")
    public ResponseEntity<Marks> saveMarks(@RequestParam Long studentId,
            @RequestParam Long subjectId,
            @RequestParam Double internal,
            @RequestParam Double lab,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Faculty faculty = academicService.getFacultyByUserId(user.getUserId());
        return ResponseEntity.ok(academicService.saveMarks(studentId, subjectId, faculty.getId(), internal, lab));
    }

    @PostMapping("/faculty/attendance")
    public ResponseEntity<Attendance> recordAttendance(@RequestParam Long studentId,
            @RequestParam Long subjectId,
            @RequestParam String date,
            @RequestParam String status,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Faculty faculty = academicService.getFacultyByUserId(user.getUserId());
        return ResponseEntity.ok(
                academicService.recordAttendance(studentId, subjectId, faculty.getId(), LocalDate.parse(date), status));
    }

    @GetMapping("/faculty/subjects")
    public ResponseEntity<?> getMySubjects(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Faculty faculty = academicService.getFacultyByUserId(user.getUserId());
        return ResponseEntity.ok(academicService.getFacultySubjects(faculty.getId()));
    }

    // --- Student Endpoints ---

    @GetMapping("/student/marks")
    public ResponseEntity<List<Marks>> getMyMarks(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Student student = academicService.getStudentByUserId(user.getUserId());
        return ResponseEntity.ok(academicService.getStudentMarks(student.getId()));
    }

    @GetMapping("/student/attendance")
    public ResponseEntity<List<Attendance>> getMyAttendance(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Student student = academicService.getStudentByUserId(user.getUserId());
        return ResponseEntity.ok(academicService.getStudentAttendance(student.getId()));
    }

    @GetMapping("/student/cgpa")
    public ResponseEntity<List<CGPA>> getMyCGPA(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Student student = academicService.getStudentByUserId(user.getUserId());
        return ResponseEntity.ok(academicService.getStudentCGPA(student.getId()));
    }
}
