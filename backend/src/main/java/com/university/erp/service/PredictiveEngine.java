package com.university.erp.service;

import com.university.erp.intelligence.CrowdProvenance;
import com.university.erp.intelligence.PredictionResult;
import com.university.erp.intelligence.Recommendation;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.repository.DigitalTwinMetricsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PredictiveEngine {

    private final DigitalTwinMetricsRepository metricsRepository;

    public Map<String, Object> predictNextWeekTrends() {
        List<DigitalTwinMetrics> historical = metricsRepository.findTop50ByMetricTypeOrderByTimestampDesc("CROWD_DENSITY").stream()
                .filter(CrowdProvenance::isMeasuredHistory)
                .toList();
        boolean fromHistory = !historical.isEmpty();
        if (!fromHistory) {
            Recommendation missing = new Recommendation(
                    "Unavailable — insufficient historical data.",
                    "Unavailable — insufficient historical data. Timetable estimates are not crowd history.",
                    null,
                    SourceClass.PREDICTED);
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("fromHistory", false);
            empty.put("available", false);
            empty.put("trend", null);
            empty.put("predictedAverageDensity", null);
            empty.put("confidenceScore", null);
            empty.put("suggestedAction", missing.action());
            return new PredictionResult("CROWD_DENSITY", null, null, missing.action(), missing.reason(), null)
                    .merge(empty);
        }
        double avgDensity = historical.stream().mapToDouble(sample -> sample.getValue() == null ? Double.NaN : sample.getValue())
                .filter(value -> !Double.isNaN(value)).average().orElse(Double.NaN);
        double recent = historical.stream().limit(10).mapToDouble(sample -> sample.getValue() == null ? Double.NaN : sample.getValue())
                .filter(value -> !Double.isNaN(value)).average().orElse(avgDensity);
        if (Double.isNaN(avgDensity)) {
            return predictNextWeekTrendsWithoutSamples();
        }
        String trend = recent > avgDensity * 1.08 ? "RISING" : recent < avgDensity * 0.92 ? "FALLING" : "STABLE";

        Recommendation action = new Recommendation(
                "Compare this average with the next timetable peak before changing corridor flow.",
                "Average of stored crowd-density samples. No confidence score is assigned, and no planning margin is added.",
                null,
                SourceClass.PREDICTED);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("fromHistory", true);
        body.put("available", true);
        body.put("trend", trend);
        body.put("predictedAverageDensity", avgDensity);
        body.put("confidenceScore", null);
        body.put("predictionTimestamp", LocalDateTime.now().plusWeeks(1));
        body.put("suggestedAction", action.action());
        return new PredictionResult("CROWD_DENSITY", null, trend, action.action(), action.reason(), SourceClass.PREDICTED)
                .merge(body);
    }

    private Map<String, Object> predictNextWeekTrendsWithoutSamples() {
        Recommendation missing = new Recommendation(
                "Stored crowd rows had no numeric value, so no average is projected.",
                "Crowd-density rows exist, but none have a usable value.",
                null,
                SourceClass.PREDICTED);
        Map<String, Object> empty = new LinkedHashMap<>();
        empty.put("fromHistory", false);
        empty.put("available", false);
        empty.put("trend", null);
        empty.put("predictedAverageDensity", null);
        empty.put("confidenceScore", null);
        empty.put("suggestedAction", missing.action());
        return new PredictionResult("CROWD_DENSITY", null, null, missing.action(), missing.reason(), null)
                .merge(empty);
    }

    public Map<String, Object> projectEnergyDemand() {
        Recommendation action = new Recommendation(
                "Do not treat a formula as a meter reading.",
                "No building telemetry is connected, so no semester forecast is stored.",
                null,
                SourceClass.PREDICTED);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("fromHistory", false);
        body.put("available", false);
        body.put("semesterForecastKW", null);
        body.put("peakRiskLevel", null);
        body.put("efficiencyGainPotential", null);
        body.put("suggestedAction", action.action());
        return new PredictionResult("ENERGY_DEMAND", null, null, action.action(), action.reason(), null)
                .merge(body);
    }
}
