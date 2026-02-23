package com.university.erp.service;

import com.university.erp.model.Student;
import com.university.erp.repository.StudentRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final StudentRepository studentRepository;

    public AnalyticsService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Cacheable("analytics")
    public Map<String, Object> getDepartmentAnalytics(Long deptId) {
        List<Student> students = studentRepository.findByDepartmentId(deptId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", students.size());
        stats.put("averageCgpa", students.stream()
                .mapToDouble(s -> s.getCurrentCgpa() != null ? s.getCurrentCgpa() : 0.0)
                .average().orElse(0.0));

        long highRiskCount = students.stream()
                .filter(s -> s.getArrearCount() != null && s.getArrearCount() > 2)
                .count();
        stats.put("highRiskCount", highRiskCount);

        return stats;
    }
}
