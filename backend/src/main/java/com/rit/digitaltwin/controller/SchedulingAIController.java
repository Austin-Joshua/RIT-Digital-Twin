package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.ExamTimetable;
import com.rit.digitaltwin.model.Timetable;
import com.rit.digitaltwin.service.TimetableGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ai/scheduling")
@RequiredArgsConstructor
public class SchedulingAIController {

    private final TimetableGenerationService timetableGenerationService;

    @PostMapping("/generate-weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<List<Timetable>> generateWeeklyTimetable(
            @RequestParam Long departmentId,
            @RequestParam String section) {
        return ResponseEntity.ok(timetableGenerationService.generateWeeklyTimetable(departmentId, section));
    }

    @PostMapping("/generate-exams")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<List<ExamTimetable>> generateExamTimetable(
            @RequestParam Long departmentId,
            @RequestParam String startDate) {
        return ResponseEntity.ok(
                timetableGenerationService.generateExamTimetable(departmentId, LocalDate.parse(startDate)));
    }
}
