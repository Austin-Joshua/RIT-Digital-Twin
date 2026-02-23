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

    @Transactional
    public RiskScore calculateRiskForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();

        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        List<Marks> marks = marksRepository.findByStudentId(studentId);

        // Simple Heuristic Algorithm:
        // Attendance weight 40%, Marks weight 40%, Arrears weight // Attendance logic:
        // count PRESENT / total records
        long presentCount = attendances.stream()
                .filter(a -> "PRESENT".equals(a.getStatus()) || "ON_DUTY".equals(a.getStatus()))
                .count();
        double avgAttendance = attendances.isEmpty() ? 100.0 : ((double) presentCount / attendances.size()) * 100.0;

        // Assume marks out of 100 for simplicity of prediction engine
        double avgMarks = marks.stream()
                .mapToDouble(m -> (m.getInternalMarks() != null ? m.getInternalMarks() : 0) +
                        (m.getLabMarks() != null ? m.getLabMarks() : 0))
                .average().orElse(100.0);

        int arrears = student.getArrearCount() != null ? student.getArrearCount() : 0;

        // Calculate failure probability (0.0 to 1.0)
        double failureProbability = 0.0;

        if (avgAttendance < 75)
            failureProbability += 0.4;
        else if (avgAttendance < 85)
            failureProbability += 0.2;

        if (avgMarks < 50)
            failureProbability += 0.4;
        else if (avgMarks < 60)
            failureProbability += 0.2;

        if (arrears > 0)
            failureProbability += Math.min(0.2, arrears * 0.05);

        // Determine Risk Level
        RiskScore.RiskLevel riskLevel;
        String suggestions;
        if (failureProbability > 0.6) {
            riskLevel = RiskScore.RiskLevel.HIGH;
            suggestions = "Immediate counseling required. Mandatory remedial classes.";
        } else if (failureProbability > 0.3) {
            riskLevel = RiskScore.RiskLevel.MEDIUM;
            suggestions = "Monitor attendance closely. Suggest peer tutoring.";
        } else {
            riskLevel = RiskScore.RiskLevel.LOW;
            suggestions = "On track. Maintain current performance.";
        }

        RiskScore score = riskScoreRepository.findByStudentId(studentId).orElse(new RiskScore());
        score.setStudent(student);
        score.setFailureProbability(failureProbability * 100);
        score.setRiskLevel(riskLevel);
        score.setSuggestedActions(suggestions);

        return riskScoreRepository.save(score);
    }
}
