package com.university.erp.repository;

import com.university.erp.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findBySemester_SemesterNumber(Integer semesterNumber);
}
