package com.university.erp.repository;

import com.university.erp.model.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {

    Optional<AcademicYear> findByYearCode(String yearCode);

    Optional<AcademicYear> findByIsCurrentTrue();

    List<AcademicYear> findByStatusOrderByYearCodeDesc(String status);
}
