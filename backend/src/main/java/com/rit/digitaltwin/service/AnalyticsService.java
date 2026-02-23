package com.rit.digitaltwin.service;

import com.rit.digitaltwin.dto.DepartmentAnalyticsDTO;
import com.rit.digitaltwin.dto.FacultyPerformanceDTO;
import com.rit.digitaltwin.dto.GrowthPassportResponse;
import com.rit.digitaltwin.model.RiskScore;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.repository.DepartmentRepository;
import com.rit.digitaltwin.repository.FacultyRepository;
import com.rit.digitaltwin.repository.RiskScoreRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final DepartmentRepository departmentRepository;
        private final StudentRepository studentRepository;
        private final FacultyRepository facultyRepository;
        private final RiskScoreRepository riskScoreRepository;
        private final CareerAnalyticsService careerAnalyticsService;

        @Cacheable("departmentAnalytics")
        @Transactional(readOnly = true)
        public List<DepartmentAnalyticsDTO> getDepartmentAnalytics() {
                return departmentRepository.findAll().stream().map(dept -> {
                        List<Student> deptStudents = studentRepository.findAll().stream()
                                        .filter(s -> s.getUser().getDepartment() != null && s.getUser().getDepartment()
                                                        .getDeptId().equals(dept.getDeptId()))
                                        .collect(Collectors.toList());

                        double avgCgpa = deptStudents.stream()
                                        .mapToDouble(s -> s.getCurrentCgpa() != null ? s.getCurrentCgpa() : 0.0)
                                        .average().orElse(0.0);

                        long total = deptStudents.size();
                        long passed = deptStudents.stream()
                                        .filter(s -> s.getArrearCount() == null || s.getArrearCount() == 0)
                                        .count();

                        double passPercent = total == 0 ? 0.0 : ((double) passed / total) * 100;

                        // New Enhanced Metrics
                        Map<String, Long> riskDist = new HashMap<>();
                        riskDist.put("LOW", 0L);
                        riskDist.put("MEDIUM", 0L);
                        riskDist.put("HIGH", 0L);

                        double totalAttendance = 0.0;
                        double totalReadiness = 0.0;
                        Map<String, Long> attDist = new HashMap<>();
                        attDist.put("<75", 0L);
                        attDist.put("75-85", 0L);
                        attDist.put(">85", 0L);

                        for (Student s : deptStudents) {
                                GrowthPassportResponse passport = careerAnalyticsService.getGrowthPassport(s.getId());
                                totalAttendance += passport.getAttendancePercentage();
                                totalReadiness += passport.getPlacementReadinessScore();

                                // Attendance Dist
                                double att = passport.getAttendancePercentage();
                                if (att < 75)
                                        attDist.put("<75", attDist.get("<75") + 1);
                                else if (att < 85)
                                        attDist.put("75-85", attDist.get("75-85") + 1);
                                else
                                        attDist.put(">85", attDist.get(">85") + 1);

                                // Risk Dist
                                RiskScore rs = riskScoreRepository.findByStudentId(s.getId()).orElse(null);
                                if (rs != null) {
                                        String level = rs.getRiskLevel().name();
                                        riskDist.put(level, riskDist.getOrDefault(level, 0L) + 1);
                                } else {
                                        riskDist.put("LOW", riskDist.get("LOW") + 1);
                                }
                        }

                        double avgAttendance = total == 0 ? 0.0 : totalAttendance / total;
                        double avgReadiness = total == 0 ? 0.0 : totalReadiness / total;

                        return DepartmentAnalyticsDTO.builder()
                                        .departmentName(dept.getDeptName())
                                        .averageCgpa(avgCgpa)
                                        .passPercentage(passPercent)
                                        .totalStudents((int) total)
                                        .avgAttendance(avgAttendance)
                                        .placementReadinessIndex(avgReadiness)
                                        .riskDistribution(riskDist)
                                        .attendanceRangeDistribution(attDist)
                                        .build();
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
