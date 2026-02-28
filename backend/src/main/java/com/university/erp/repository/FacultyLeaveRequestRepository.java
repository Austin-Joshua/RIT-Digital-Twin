package com.university.erp.repository;

import com.university.erp.entity.FacultyLeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyLeaveRequestRepository extends JpaRepository<FacultyLeaveRequest, Long> {
}
