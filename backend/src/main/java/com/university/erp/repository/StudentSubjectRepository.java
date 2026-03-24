package com.university.erp.repository;

import com.university.erp.entity.StudentSubject;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentSubjectRepository extends JpaRepository<StudentSubject, Long> {
    @EntityGraph(attributePaths = { "student", "subject", "semester" })
    List<StudentSubject> findByStudent_IdAndSemester_SemesterNumberAndStatusIgnoreCase(Long studentId, Integer semester, String status);

    @EntityGraph(attributePaths = { "student", "subject", "semester" })
    List<StudentSubject> findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(Long studentId);

    List<StudentSubject> findByStudent_SectionIgnoreCaseAndSubject_IdAndSemester_SemesterNumber(String section, Long subjectId, Integer semester);

    Optional<StudentSubject> findByStudent_IdAndSubject_IdAndSemester_SemesterId(Long studentId, Long subjectId, Long semesterId);
}
