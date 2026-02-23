package com.rit.digitaltwin.service;

import com.rit.digitaltwin.dto.DepartmentAnalyticsDTO;
import com.rit.digitaltwin.dto.FacultyPerformanceDTO;
import com.rit.digitaltwin.repository.DepartmentRepository;
import com.rit.digitaltwin.repository.FacultyRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final DepartmentRepository departmentRepository;
        private final StudentRepository studentRepository;
        private final FacultyRepository facultyRepository;

        @Cacheable("departmentAnalytics")
        @Transactional(readOnly = true)
        public List<DepartmentAnalyticsDTO> getDepartmentAnalytics() {
                return departmentRepository.findAll().stream().map(dept -> {

                        double avgCgpa = studentRepository.findAll().stream()
                                        .filter(s -> s.getUser().getDepartment() != null && s.getUser().getDepartment()
                                                        .getDeptId().equals(dept.getDeptId()))
                                        .mapToDouble(s -> s.getCurrentCgpa() != null ? s.getCurrentCgpa() : 0.0)
                                        .average().orElse(0.0);

                        long total = studentRepository.findAll().stream()
                                        .filter(s -> s.getUser().getDepartment() != null && s.getUser().getDepartment()
                                                        .getDeptId().equals(dept.getDeptId()))
                                        .count();

                        long passed = studentRepository.findAll().stream()
                                        .filter(s -> s.getUser().getDepartment() != null && s.getUser().getDepartment()
                                                        .getDeptId().equals(dept.getDeptId()))
                                        .filter(s -> s.getArrearCount() == null || s.getArrearCount() == 0)
                                        .count();

                        double passPercent = total == 0 ? 0.0 : ((double) passed / total) * 100;

                        return new DepartmentAnalyticsDTO(dept.getDeptName(), avgCgpa, passPercent, (int) total);
                }).collect(Collectors.toList());
        }

        @Cacheable("facultyPerformance")
        @Transactional(readOnly = true)
        public List<FacultyPerformanceDTO> getFacultyPerformanceIndex() {
                return facultyRepository.findAll().stream().map(fac -> {
                        String deptName = fac.getUser().getDepartment() != null
                                        ? fac.getUser().getDepartment().getDeptName()
                                        : "General";
                        String facName = fac.getUser().getFirstName() + " " + fac.getUser().getLastName();

                        double simulatedScore = 70.0 + (fac.getId() % 30);
                        double simulatedPassRate = 60.0 + (fac.getId() % 35);

                        return new FacultyPerformanceDTO(facName, deptName, simulatedPassRate, simulatedScore);
                }).collect(Collectors.toList());
        }
}
