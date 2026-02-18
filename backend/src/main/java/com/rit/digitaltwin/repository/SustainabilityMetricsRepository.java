package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SustainabilityMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SustainabilityMetricsRepository extends JpaRepository<SustainabilityMetrics, Long> {

    List<SustainabilityMetrics> findByPeriodLabel(String periodLabel);

    @Query("SELECT s FROM SustainabilityMetrics s ORDER BY s.recordedDate DESC")
    List<SustainabilityMetrics> findAllOrderByDateDesc();

    @Query("SELECT s FROM SustainabilityMetrics s ORDER BY s.recordedDate DESC LIMIT 1")
    Optional<SustainabilityMetrics> findLatest();
}
