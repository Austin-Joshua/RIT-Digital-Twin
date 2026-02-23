package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByStudentId(Long studentId);

    List<LeaveApplication> findByStatus(String status);
}
