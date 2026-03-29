package com.university.erp.repository;

import com.university.erp.model.PerformanceWarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerformanceWarningRepository extends JpaRepository<PerformanceWarning, Long> {
    List<PerformanceWarning> findByStudent_IdOrderByAnalyzedAtDesc(Long studentId);
}
