package com.university.erp.repository;

import com.university.erp.model.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignment_Id(Long assignmentId);
    List<AssignmentSubmission> findByStudent_Id(Long studentId);
    Optional<AssignmentSubmission> findByAssignment_IdAndStudent_Id(Long assignmentId, Long studentId);
    List<AssignmentSubmission> findByAssignment_Faculty_Id(Long facultyUserId);
    List<AssignmentSubmission> findByAssignment_Subject_Department_DeptNameIgnoreCase(String departmentName);
}
