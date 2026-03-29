package com.university.erp.repository;

import com.university.erp.model.StudentAcademic;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentAcademicRepository extends JpaRepository<StudentAcademic, Long> {
    @EntityGraph(attributePaths = { "student" })
    List<StudentAcademic> findByStudent_IdOrderBySemesterAsc(Long studentId);

    Optional<StudentAcademic> findByStudent_IdAndSemester(Long studentId, Integer semester);
}
