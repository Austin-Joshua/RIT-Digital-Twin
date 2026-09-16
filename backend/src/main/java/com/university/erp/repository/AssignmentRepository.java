package com.university.erp.repository;

import com.university.erp.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findBySubject_Id(Long subjectId);
    List<Assignment> findBySubject_Department_Id(Long departmentId);
    List<Assignment> findByFaculty_Id(Long facultyUserId);
    List<Assignment> findBySectionIgnoreCase(String section);
}
