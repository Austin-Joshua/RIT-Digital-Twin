package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.StudyPlan;
import com.rit.digitaltwin.service.StudyPlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/academic")
@RequiredArgsConstructor
public class AcademicAIHelperController {

    private final StudyPlannerService studyPlannerService;

    @PostMapping("/study-plan/{studentId}")
    public ResponseEntity<List<StudyPlan>> generateStudyPlan(@PathVariable Long studentId) {
        return ResponseEntity.ok(studyPlannerService.generateStudyPlan(studentId));
    }

    @GetMapping("/skill-gap/{studentId}")
    public ResponseEntity<Map<String, Object>> getSkillGapAnalysis(@PathVariable Long studentId) {
        return ResponseEntity.ok(studyPlannerService.analyzeSkillGap(studentId));
    }
}
