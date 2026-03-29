package com.university.erp.service;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScenarioSimulationService {

    private final DigitalTwinMetricsRepository metricsRepository;

    public List<DigitalTwinMetrics> runWhatIfScenario(String scenarioName, int additionalStudentIntake) {
        // In a real scenario, we'd adjust existing data or create mock data.
        // For this implementation, we'll simulate the "Impact" as a scaling factor on existing metrics.
        
        List<DigitalTwinMetrics> baseline = metricsRepository.findAll().stream()
                .filter(m -> m.getScenarioName() == null && m.getIsSimulated())
                .limit(20)
                .toList();

        List<DigitalTwinMetrics> scenarioResults = new ArrayList<>();
        double impactFactor = 1.0 + (additionalStudentIntake / 1000.0); // Simple linear impact model

        for (DigitalTwinMetrics base : baseline) {
            scenarioResults.add(metricsRepository.save(DigitalTwinMetrics.builder()
                    .metricType(base.getMetricType())
                    .locationCode(base.getLocationCode())
                    .value(base.getValue() * impactFactor)
                    .unit(base.getUnit())
                    .timestamp(java.time.LocalDateTime.now())
                    .isSimulated(true)
                    .scenarioName(scenarioName)
                    .build()));
        }
        return scenarioResults;
    }
}
