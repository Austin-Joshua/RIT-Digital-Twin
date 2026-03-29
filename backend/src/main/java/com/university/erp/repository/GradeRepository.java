package com.university.erp.repository;

import com.university.erp.model.Grade;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    @EntityGraph(attributePaths = { "student", "subject", "semester" })
    List<Grade> findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(Long studentId);

    @EntityGraph(attributePaths = { "student", "subject", "semester" })
    List<Grade> findByStudent_IdAndSemester_SemesterNumberOrderBySubject_SubjectCodeAsc(Long studentId, Integer semesterNumber);

    boolean existsByStudent_IdAndSubject_IdAndSemester_SemesterId(Long studentId, Long subjectId, Long semesterId);
}
