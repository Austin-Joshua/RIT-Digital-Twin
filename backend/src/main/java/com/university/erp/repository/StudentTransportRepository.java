package com.university.erp.repository;

import com.university.erp.entity.StudentTransportMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentTransportRepository extends JpaRepository<StudentTransportMapping, Long> {
    List<StudentTransportMapping> findByStudentId(Long studentId);
}
