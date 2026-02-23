package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.RiskScore;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.model.Attendance;
import com.rit.digitaltwin.model.Marks;
import com.rit.digitaltwin.repository.RiskScoreRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import com.rit.digitaltwin.repository.AttendanceRepository;
import com.rit.digitaltwin.repository.MarksRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskScoreRepository riskScoreRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final NotificationService notificationService;

    @Transactional
    public RiskScore calculateRiskForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();

        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        List<Marks> marks = marksRepository.findByStudentId(studentId);

        // Attendance Impact
        long presentCount = attendances.stream()
                .filter(a -> "PRESENT".equals(a.getStatus()) || "ON_DUTY".equals(a.getStatus()))
                .count();
        double attendancePercent = attendances.isEmpty() ? 100.0 : ((double) presentCount / attendances.size()) * 100.0;
        double attendanceImpact = attendancePercent < 75.0 ? 1.0 : (attendancePercent < 85.0 ? 0.5 : 0.0);

        // Internal Mark Impact
        double avgInternal = marks.stream().mapToDouble(m -> m.getInternalMarks() != null ? m.getInternalMarks() : 0)
                .average().orElse(100.0);
        double internalImpact = avgInternal < 50.0 ? 1.0 : (avgInternal < 60.0 ? 0.5 : 0.0);

        // Lab Mark Impact
        double avgLab = marks.stream().mapToDouble(m -> m.getLabMarks() != null ? m.getLabMarks() : 0).average()
                .orElse(100.0);
        double labImpact = avgLab < 50.0 ? 1.0 : (avgLab < 60.0 ? 0.5 : 0.0);

        // Previous GPA Impact
        double cgpa = student.getCurrentCgpa() != null ? student.getCurrentCgpa() : 10.0;
        int arrears = student.getArrearCount() != null ? student.getArrearCount() : 0;
        double gpaImpact = cgpa < 5.0 || arrears >= 3 ? 1.0 : (cgpa < 6.0 || arrears > 0 ? 0.5 : 0.0);

        // Weighted scoring model: Risk Score = (0.30 * Attendance Impact) + (0.30 *
        // Internal Mark Impact) + (0.20 * Lab Mark Impact) + (0.20 * Previous GPA
        // Impact)
        double riskScoreValue = (0.30 * attendanceImpact) + (0.30 * internalImpact) + (0.20 * labImpact)
                + (0.20 * gpaImpact);
        double failureProbability = riskScoreValue * 100.0;

        // Determine Risk Level
        RiskScore.RiskLevel riskLevel;
        String suggestions;
        if (failureProbability >= 60.0) {
            riskLevel = RiskScore.RiskLevel.HIGH;
            suggestions = "Immediate counseling required. Mandatory remedial classes.";
        } else if (failureProbability >= 30.0) {
            riskLevel = RiskScore.RiskLevel.MEDIUM;
            suggestions = "Monitor attendance closely. Suggest peer tutoring.";
        } else {
            riskLevel = RiskScore.RiskLevel.LOW;
            suggestions = "On track. Maintain current performance.";
        }

        RiskScore score = riskScoreRepository.findByStudentId(studentId).orElse(new RiskScore());
        score.setStudent(student);
        score.setFailureProbability(failureProbability);
        score.setRiskLevel(riskLevel);
        score.setSuggestedActions(suggestions);

        RiskScore savedScore = riskScoreRepository.save(score);

        // Auto-notification for High risk via WebSockets
        if (riskLevel == RiskScore.RiskLevel.HIGH && student.getUser() != null) {
            notificationService.sendToUser(
                    student.getUser().getUserId(),
                    "Academic Risk Alert",
                    "Your academic risk profile is currently evaluated as HIGH ("
                            + String.format("%.1f", failureProbability) + "%). Please consult your mentor immediately.",
                    "WARNING");
        }

        return savedScore;
    }
}
