package com.university.erp.service;

import com.university.erp.entity.InternalMark;
import com.university.erp.entity.PerformanceWarning;
import com.university.erp.entity.Student;
import com.university.erp.repository.InternalMarkRepository;
import com.university.erp.repository.PerformanceWarningRepository;
import com.university.erp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentSuccessService {

    private final InternalMarkRepository internalMarkRepository;
    private final PerformanceWarningRepository performanceWarningRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public void runPerformanceAnalysisForAllStudents() {
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            analyzeStudentPerformance(student);
        }
    }

    @Transactional
    public PerformanceWarning analyzeStudentPerformance(Student student) {
        List<InternalMark> marks = internalMarkRepository.findByStudentSubject_Student_Id(student.getId());
        if (marks.isEmpty()) return null;

        // Calculate average internal mark percentage
        double avgMark = marks.stream()
                .mapToDouble(m -> m.getTotalInternal() != null ? m.getTotalInternal().doubleValue() : 0.0)
                .average()
                .orElse(0.0);

        String status = "On Track";
        String observation = "Good academic standing.";
        String recommendation = "Continue consistent effort.";

        if (avgMark < 25) { // Assuming internal is out of 50
            status = "Critical";
            observation = "Consistently low internal marks.";
            recommendation = "Mandatory remedial classes and faculty consultation.";
        } else if (avgMark < 35) {
            status = "Needs Attention";
            observation = "Below average marks in multiple subjects.";
            recommendation = "Extra assignments and subject-specific tutoring recommended.";
        }

        PerformanceWarning warning = PerformanceWarning.builder()
                .student(student)
                .status(status)
                .observation(observation)
                .recommendation(recommendation)
                .analyzedAt(LocalDateTime.now())
                .isResolved(false)
                .build();

        return performanceWarningRepository.save(warning);
    }
}
