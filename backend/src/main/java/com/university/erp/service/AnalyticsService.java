package com.university.erp.service;

import com.university.erp.entity.Student;
import com.university.erp.repository.StudentRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

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
        BigDecimal totalCgpa = students.stream()
                .map(s -> s.getCurrentCgpa() != null ? s.getCurrentCgpa() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.math.BigDecimal averageCgpa = students.isEmpty() ? java.math.BigDecimal.ZERO
                : totalCgpa.divide(java.math.BigDecimal.valueOf(students.size()), 2, java.math.RoundingMode.HALF_UP);

        stats.put("averageCgpa", averageCgpa);

        long highRiskCount = students.stream()
                .filter(s -> s.getArrearCount() != null && s.getArrearCount() > 2)
                .count();
        stats.put("highRiskCount", highRiskCount);

        return stats;
    }
}
