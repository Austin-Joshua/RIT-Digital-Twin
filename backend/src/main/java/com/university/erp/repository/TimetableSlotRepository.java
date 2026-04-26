package com.university.erp.repository;

import com.university.erp.model.TimetableSlot;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
    @EntityGraph(attributePaths = { "subject", "subject.department", "subject.semester", "faculty", "faculty.role", "department" })
    List<TimetableSlot> findByDepartmentIdAndSection(Long departmentId, String section);
    @EntityGraph(attributePaths = { "subject", "subject.department", "subject.semester", "faculty", "faculty.role", "department" })
    List<TimetableSlot> findByDepartmentId(Long departmentId);
    @EntityGraph(attributePaths = { "subject", "subject.department", "subject.semester", "faculty", "faculty.role", "department" })
    List<TimetableSlot> findByDepartmentIdAndSectionIn(Long departmentId, List<String> sections);
    void deleteByDepartmentIdAndSectionIn(Long departmentId, List<String> sections);
}
