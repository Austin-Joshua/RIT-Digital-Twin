package com.university.erp.repository;

import com.university.erp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);

    org.springframework.data.domain.Page<Attendance> findByStudentId(Long studentId,
            org.springframework.data.domain.Pageable pageable);
}
