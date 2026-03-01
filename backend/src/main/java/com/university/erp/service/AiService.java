package com.university.erp.service;

import com.university.erp.model.Student;
import com.university.erp.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiService {

    private final StudentRepository studentRepository;

    public AiService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public String predictAcademicRisk(@org.springframework.lang.NonNull Long studentId) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        Student student = studentRepository.findById(studentId).orElseThrow();

        if (student.getCurrentCgpa() < 5.0 || student.getArrearCount() > 2) {
            return "HIGH_RISK";
        } else if (student.getCurrentCgpa() < 7.0) {
            return "MODERATE_RISK";
        }
        return "LOW_RISK";
    }

    public List<String> recommendCareer(@org.springframework.lang.NonNull Long studentId) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        Student student = studentRepository.findById(studentId).orElseThrow();
        List<String> recommendations = new ArrayList<>();

        // Simple logic based on CGPA and performance indicators
        if (student.getCurrentCgpa() > 8.5) {
            recommendations.add("Research Scientist");
            recommendations.add("Software Architect");
        } else if (student.getCurrentCgpa() > 7.0) {
            recommendations.add("Full Stack Developer");
            recommendations.add("Systems Analyst");
        } else {
            recommendations.add("Technical Support");
            recommendations.add("Quality Assurance");
        }
        return recommendations;
    }
}
