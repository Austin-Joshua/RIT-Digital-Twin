package com.university.erp.repository;

import com.university.erp.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
    Optional<Semester> findBySemesterNumber(Integer semesterNumber);
}
