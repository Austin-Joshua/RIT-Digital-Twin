package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Subject;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.repository.SubjectRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CGPASimulatorService {

    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;

    public Double simulateProjectedSemesterGPA(Long studentId, Map<Long, Integer> expectedGrades) {
        // expectedGrades: Map<SubjectId, GradePoints (10, 9, 8, etc)>
        studentRepository.findById(studentId).orElseThrow();

        int totalCredits = 0;
        double totalGradePoints = 0.0;

        for (Map.Entry<Long, Integer> entry : expectedGrades.entrySet()) {
            Subject subject = subjectRepository.findById(entry.getKey()).orElseThrow();
            int credits = subject.getCredits() != null ? subject.getCredits() : 3;
            int gradePoint = entry.getValue();

            totalCredits += credits;
            totalGradePoints += (credits * gradePoint);
        }

        if (totalCredits == 0)
            return 0.0;

        return totalGradePoints / totalCredits;
    }

    public Double simulateProjectedCGPA(Long studentId, Map<Long, Integer> expectedGrades,
            int currentCompletedCredits) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        Double currentCgpa = student.getCurrentCgpa() != null ? student.getCurrentCgpa() : 0.0;

        double currentTotalPoints = currentCgpa * currentCompletedCredits;

        int simulatedSemesterCredits = 0;
        double simulatedSemesterPoints = 0.0;

        for (Map.Entry<Long, Integer> entry : expectedGrades.entrySet()) {
            Subject subject = subjectRepository.findById(entry.getKey()).orElseThrow();
            int credits = subject.getCredits() != null ? subject.getCredits() : 3;
            simulatedSemesterCredits += credits;
            simulatedSemesterPoints += (credits * entry.getValue());
        }

        int newTotalCredits = currentCompletedCredits + simulatedSemesterCredits;
        if (newTotalCredits == 0)
            return currentCgpa;

        return (currentTotalPoints + simulatedSemesterPoints) / newTotalCredits;
    }
}
