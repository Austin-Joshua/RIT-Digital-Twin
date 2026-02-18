package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SustainabilityMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SustainabilityMetricRepository extends JpaRepository<SustainabilityMetric, Long> {
}
