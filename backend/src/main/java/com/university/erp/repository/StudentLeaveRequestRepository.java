package com.university.erp.repository;

import com.university.erp.model.StudentLeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentLeaveRequestRepository extends JpaRepository<StudentLeaveRequest, Long> {
    List<StudentLeaveRequest> findByStudentId(String studentId);
}
