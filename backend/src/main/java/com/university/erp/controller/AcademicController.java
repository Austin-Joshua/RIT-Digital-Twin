package com.university.erp.controller;

import com.university.erp.entity.Marks;
import com.university.erp.service.AcademicService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic")
public class AcademicController {

    private final AcademicService academicService;

    public AcademicController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @PostMapping("/marks/{studentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<String> enterMarks(@PathVariable @org.springframework.lang.NonNull Long studentId, @RequestBody @org.springframework.lang.NonNull Marks marks) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        java.util.Objects.requireNonNull(marks, "marks payload must not be null");
        academicService.enterMarks(studentId, marks);
        return ResponseEntity.ok("Marks entered successfully");
    }

    @GetMapping("/marks/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY')")
    public ResponseEntity<List<Marks>> getStudentMarks(@PathVariable @org.springframework.lang.NonNull Long studentId) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        return ResponseEntity.ok(academicService.getStudentMarks(studentId));
    }
}
