package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicWorkflowService {

    private final StudentRepository studentRepository;
    private final RankingRepository rankingRepository;
    private final NotificationService notificationService;

    @Transactional
    public void calculateRankings(Long departmentId, Integer semester) {
        List<Student> students = studentRepository.findAll().stream()
                .filter(s -> s.getUser().getDepartment() != null
                        && s.getUser().getDepartment().getDeptId().equals(departmentId))
                .sorted(Comparator.comparing(Student::getCurrentCgpa).reversed())
                .collect(Collectors.toList());

        rankingRepository.deleteAll(); // Clear old rankings

        for (int i = 0; i < students.size(); i++) {
            Student s = students.get(i);
            Ranking ranking = Ranking.builder()
                    .student(s)
                    .departmentRank(i + 1)
                    .semester(semester)
                    .department(s.getUser().getDepartment())
                    .batch(s.getYear().toString())
                    .build();
            rankingRepository.save(ranking);
        }
    }

    @Transactional
    public void publishResults(Long deptId, Integer semester) {
        // Mark as published in DB
        calculateRankings(deptId, semester);

        // Notify all students in department
        notificationService.broadcastGlobal(
                "Results Published",
                "Semester " + semester + " results are now available for viewing.",
                "ACADEMIC");
    }

    public List<Ranking> getTopRankers(Long deptId, int limit) {
        return rankingRepository.findAll().stream()
                .filter(r -> r.getDepartment() != null && r.getDepartment().getDeptId().equals(deptId))
                .sorted(Comparator.comparing(Ranking::getDepartmentRank))
                .limit(limit)
                .collect(Collectors.toList());
    }
}
