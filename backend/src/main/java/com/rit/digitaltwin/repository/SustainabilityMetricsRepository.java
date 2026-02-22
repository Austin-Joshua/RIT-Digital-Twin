package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SustainabilityMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SustainabilityMetricsRepository extends JpaRepository<SustainabilityMetric, Long> {

    List<SustainabilityMetric> findByEnergyScoreGreaterThan(Double score);

    @Query("SELECT s FROM SustainabilityMetric s ORDER BY s.date DESC")
    List<SustainabilityMetric> findAllOrderByDateDesc();

    Optional<SustainabilityMetric> findFirstByOrderByDateDesc();
}
