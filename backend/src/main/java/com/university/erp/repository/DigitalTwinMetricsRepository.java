package com.university.erp.repository;

import com.university.erp.model.DigitalTwinMetrics;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalTwinMetricsRepository extends JpaRepository<DigitalTwinMetrics, Long> {
    List<DigitalTwinMetrics> findByMetricTypeAndLocationCodeOrderByTimestampDesc(String type, String code);

    List<DigitalTwinMetrics> findTop50ByMetricTypeOrderByTimestampDesc(String metricType);

    @Query("select m from DigitalTwinMetrics m where m.scenarioName is null and m.isSimulated = true order by m.timestamp desc")
    List<DigitalTwinMetrics> findRecentBaselineSimulations(Pageable pageable);
}
