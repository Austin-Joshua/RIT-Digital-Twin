package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.ResultApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultApprovalRepository extends JpaRepository<ResultApproval, Long> {
    List<ResultApproval> findByDepartmentIdAndSemester(Long departmentId, Integer semester);
}
