package com.rit.digitaltwin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rit.digitaltwin.dto.PredictiveForecastResponse;
import com.rit.digitaltwin.dto.PredictiveForecastResponse.ForecastPoint;
import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.model.SimulationStatus;
import com.rit.digitaltwin.model.SimulationType;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import com.rit.digitaltwin.simulation.PredictiveEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Predictive Analytics Service (Refactored)
 * Delegates forecasting logic to PredictiveEngine
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictiveAnalyticsService {

        private final SimulationResultRepository simulationResultRepository;
        private final ObjectMapper objectMapper;
        private final PredictiveEngine predictiveEngine;

        @Transactional
        public PredictiveForecastResponse generateForecast(String metric, int months) {
                long startTime = System.currentTimeMillis();
                log.info("Generating predictive forecast for: {}, horizon: {} months", metric, months);

                // --- 1. Historical Data ( Simulated ) ---
                List<Double> history = predictiveEngine.generateHistory(metric);

                // --- 2. Forecast Generation ---
                List<ForecastPoint> forecastPoints = predictiveEngine.generateForecast(history, months);

                double currentVal = history.get(history.size() - 1);
                double finalVal = forecastPoints.get(forecastPoints.size() - 1).getValue();
                double growthRate = ((finalVal - currentVal) / currentVal) * 100;

                String trendDirection = growthRate > 5 ? "INCREASING" : growthRate < -5 ? "DECREASING" : "STABLE";
                double confidence = 85.0 - (months * 1.5); // Confidence drops with horizon

                // --- 3. Insights ---
                List<String> insights = predictiveEngine.generateInsights(metric, trendDirection, growthRate);

                long execTime = System.currentTimeMillis() - startTime;
                String summary = String.format("Forecasted %s for %d months. Trend: %s (%.1f%%). Confidence: %.0f%%.",
                                metric, months, trendDirection, growthRate, confidence);

                saveResult(metric, months, summary, execTime);

                return PredictiveForecastResponse.builder()
                                .metric(metric)
                                .forecastHorizonMonths(months)
                                .trendDirection(trendDirection)
                                .predictedGrowthRate(growthRate)
                                .confidenceScore(confidence)
                                .forecastData(forecastPoints)
                                .keyInsights(insights)
                                .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                                .build();
        }

        private void saveResult(String metric, int months, String summary, long execTime) {
                try {
                        Map<String, Object> params = new HashMap<>();
                        params.put("metric", metric);
                        params.put("months", months);

                        SimulationResult result = SimulationResult.builder()
                                        .simulationType(SimulationType.PREDICTIVE_ANALYTICS)
                                        .simulationName("Forecast - " + metric)
                                        .parameters(objectMapper.writeValueAsString(params))
                                        .results("{}")
                                        .summary(summary)
                                        .executionTimeMs(execTime)
                                        .status(SimulationStatus.COMPLETED)
                                        .startedAt(LocalDateTime.now().minus(execTime, ChronoUnit.MILLIS))
                                        .completedAt(LocalDateTime.now())
                                        .build();
                        simulationResultRepository.save(result);
                } catch (JsonProcessingException e) {
                        log.error("Failed to save forecast result", e);
                }
        }
}
