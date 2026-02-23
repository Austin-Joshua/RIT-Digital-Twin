package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.Timetable;
import com.rit.digitaltwin.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TimetableAIController {

    private final TimetableService timetableService;

    @PostMapping("/generate-timetable")
    public ResponseEntity<List<Timetable>> generateTimetable(@RequestParam Long facultyId,
            @RequestParam Long subjectId,
            @RequestParam Integer totalHours,
            @RequestParam String classList) {
        return ResponseEntity.ok(timetableService.generateWeeklyTimetable(facultyId, subjectId, totalHours, classList));
    }
}
