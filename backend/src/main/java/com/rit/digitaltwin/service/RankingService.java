package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Ranking;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.repository.RankingRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final RankingRepository rankingRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public void generateRankings() {
        // Fetch all students and group by year and section for class ranking
        List<Student> allStudents = studentRepository.findAll();

        // 1. Sort globally (Department Rank logic conceptually if all are same dept)
        // Tie-breaker: Higher CGPA, then fewer arrears.
        List<Student> sortedByCgpa = allStudents.stream()
                .sorted(Comparator
                        .comparing(Student::getCurrentCgpa, Comparator.nullsFirst(Double::compareTo).reversed())
                        .thenComparing(Student::getArrearCount, Comparator.nullsLast(Integer::compareTo)))
                .collect(Collectors.toList());

        for (int i = 0; i < sortedByCgpa.size(); i++) {
            Student s = sortedByCgpa.get(i);
            Ranking ranking = rankingRepository.findByStudentId(s.getId()).orElse(new Ranking());
            ranking.setStudent(s);
            ranking.setDepartmentRank(i + 1);

            // To compute class rank (same year and section):
            long classRank = sortedByCgpa.stream()
                    .filter(other -> other.getYear().equals(s.getYear()) && other.getSection().equals(s.getSection()))
                    .filter(other -> other.getCurrentCgpa() != null && s.getCurrentCgpa() != null
                            && other.getCurrentCgpa() >= s.getCurrentCgpa())
                    .count();

            ranking.setClassRank((int) classRank);

            rankingRepository.save(ranking);
        }
    }

    public Ranking getStudentRanking(Long studentId) {
        return rankingRepository.findByStudentId(studentId).orElse(null);
    }
}
