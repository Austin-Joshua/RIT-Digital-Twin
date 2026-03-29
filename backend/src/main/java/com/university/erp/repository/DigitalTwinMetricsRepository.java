package com.university.erp.repository;

import com.university.erp.model.DigitalTwinMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DigitalTwinMetricsRepository extends JpaRepository<DigitalTwinMetrics, Long> {
    List<DigitalTwinMetrics> findByMetricTypeAndLocationCodeOrderByTimestampDesc(String type, String code);
}
