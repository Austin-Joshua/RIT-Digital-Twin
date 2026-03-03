package com.university.erp.repository;

import com.university.erp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentIdNumber(String studentIdNumber);

    Optional<Student> findByUserId(Long userId);

    List<Student> findByDepartmentId(Long departmentId);

    org.springframework.data.domain.Page<Student> findByDepartmentId(Long departmentId,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Student> findAll(org.springframework.data.domain.Pageable pageable);
}
