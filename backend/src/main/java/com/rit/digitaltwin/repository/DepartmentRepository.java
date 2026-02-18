package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByCode(String code);

    Optional<Department> findByNameIgnoreCase(String name);

    List<Department> findByIsActiveTrue();
}
