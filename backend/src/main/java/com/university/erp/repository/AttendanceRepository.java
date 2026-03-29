package com.university.erp.repository;

import com.university.erp.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);

    org.springframework.data.domain.Page<Attendance> findByStudentId(Long studentId,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT a FROM Attendance a JOIN a.student s WHERE s.department.id = :departmentId")
    List<Attendance> findByDepartmentId(Long departmentId);

    List<Attendance> findByStudent_IdIn(java.util.Collection<Long> studentIds);
}
