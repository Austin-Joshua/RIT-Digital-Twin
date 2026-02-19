package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SustainabilityMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SustainabilityMetricRepository extends JpaRepository<SustainabilityMetric, Long> {
    Optional<SustainabilityMetric> findByDate(LocalDate date);
}
