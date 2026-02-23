package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.ExamTimetable;
import com.rit.digitaltwin.model.Ranking;
import com.rit.digitaltwin.model.RiskScore;
import com.rit.digitaltwin.model.SubstitutionLog;
import com.rit.digitaltwin.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic-ai")
@RequiredArgsConstructor
public class AcademicAIController {

    private final RiskPredictionService riskPredictionService;
    private final CGPASimulatorService cgpaSimulatorService;
    private final SubstitutionEngineService substitutionEngineService;
    private final ExamTimetableService examTimetableService;
    private final RankingService rankingService;
    private final AttendanceAlertService attendanceAlertService;

    @GetMapping("/risk/{studentId}")
    public ResponseEntity<RiskScore> getRiskPrediction(@PathVariable Long studentId) {
        return ResponseEntity.ok(riskPredictionService.calculateRiskForStudent(studentId));
    }

    @PostMapping("/simulate-cgpa/{studentId}")
    public ResponseEntity<Double> simulateCGPA(@PathVariable Long studentId,
            @RequestParam int currentCredits,
            @RequestBody Map<Long, Integer> expectedGrades) {
        return ResponseEntity.ok(cgpaSimulatorService.simulateProjectedCGPA(studentId, expectedGrades, currentCredits));
    }

    @PostMapping("/substitute-class/{timetableId}")
    public ResponseEntity<SubstitutionLog> substituteClass(@PathVariable Long timetableId) {
        return ResponseEntity.ok(substitutionEngineService.substituteClass(timetableId));
    }

    @PostMapping("/generate-exam-timetable")
    public ResponseEntity<List<ExamTimetable>> generateExamTimetable(@RequestParam String startDate) {
        return ResponseEntity.ok(examTimetableService.generateExamTimetable(LocalDate.parse(startDate)));
    }

    @GetMapping("/ranking/{studentId}")
    public ResponseEntity<Ranking> getStudentRanking(@PathVariable Long studentId) {
        // Just triggered globally to ensure up to date, then fetched
        rankingService.generateRankings();
        return ResponseEntity.ok(rankingService.getStudentRanking(studentId));
    }

    @PostMapping("/trigger-alerts/{studentId}")
    public ResponseEntity<Void> triggerAttendanceAlerts(@PathVariable Long studentId) {
        attendanceAlertService.checkAndTriggerAlerts(studentId);
        return ResponseEntity.ok().build();
    }
}
