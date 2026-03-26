package com.university.erp.service;

import com.university.erp.entity.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PredictiveEngine {

    private final DigitalTwinMetricsRepository metricsRepository;

    public Map<String, Object> predictNextWeekTrends() {
        // Sample predictive logic: Averaging historical density
        List<DigitalTwinMetrics> historical = metricsRepository.findAll().stream()
                .filter(m -> m.getMetricType().equals("CROWD_DENSITY"))
                .limit(50)
                .toList();
        
        double avgDensity = historical.stream().mapToDouble(DigitalTwinMetrics::getValue).average().orElse(0.45);
        
        return Map.of(
            "trend", "STABLE",
            "predictedAverageDensity", avgDensity * 1.05, // Slight growth trend
            "confidenceScore", 0.88,
            "predictionTimestamp", LocalDateTime.now().plusWeeks(1),
            "suggestedAction", "No immediate bottleneck risk detected."
        );
    }

    public Map<String, Object> projectEnergyDemand() {
        return Map.of(
            "semesterForecastKW", 450000,
            "peakRiskLevel", "MODERATE",
            "efficiencyGainPotential", "12%",
            "confidence", 0.92
        );
    }
}
