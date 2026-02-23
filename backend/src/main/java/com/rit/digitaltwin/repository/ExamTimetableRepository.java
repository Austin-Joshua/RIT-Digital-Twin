package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.ExamTimetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamTimetableRepository extends JpaRepository<ExamTimetable, Long> {
    List<ExamTimetable> findByExamDate(LocalDate examDate);

    List<ExamTimetable> findByInvigilatorId(Long facultyId);
}
