package com.university.erp.repository;

import com.university.erp.entity.Department;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    @Cacheable(value = "departments", key = "#code")
    Optional<Department> findByCode(String code);
}
