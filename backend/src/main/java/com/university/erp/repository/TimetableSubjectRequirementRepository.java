package com.university.erp.repository;

import com.university.erp.model.TimetableSubjectRequirement;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableSubjectRequirementRepository extends JpaRepository<TimetableSubjectRequirement, Long> {
    @EntityGraph(attributePaths = { "department", "semester", "subject", "subject.department", "subject.semester" })
    List<TimetableSubjectRequirement> findByDepartment_IdAndSectionIgnoreCase(Long departmentId, String section);

    @EntityGraph(attributePaths = { "department", "semester", "subject", "subject.department", "subject.semester" })
    List<TimetableSubjectRequirement> findByDepartment_IdAndSectionIgnoreCaseAndSemester_SemesterNumber(Long departmentId, String section, Integer semesterNumber);

    @EntityGraph(attributePaths = { "department", "semester", "subject", "subject.department", "subject.semester" })
    List<TimetableSubjectRequirement> findByDepartment_Id(Long departmentId);

    @EntityGraph(attributePaths = { "department", "semester", "subject", "subject.department", "subject.semester" })
    List<TimetableSubjectRequirement> findByDepartment_IdAndSemester_SemesterNumber(Long departmentId, Integer semesterNumber);
}
