package com.university.erp.repository;

import com.university.erp.entity.HostelAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HostelAssignmentRepository extends JpaRepository<HostelAssignment, Long> {
    Optional<HostelAssignment> findByStudent_IdAndStatus(Long studentId, String status);
}
