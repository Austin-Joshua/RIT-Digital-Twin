package com.rit.digitaltwin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rit.digitaltwin.dto.EnergySimulationRequest;
import com.rit.digitaltwin.dto.EnergySimulationResponse;
import com.rit.digitaltwin.dto.EnergySimulationResponse.*;
import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnergySimulationService {

        private final SimulationResultRepository simulationResultRepository;
        private final ObjectMapper objectMapper;

        // Typical RIT campus energy profiles (kWh per hour, averaged over buildings)
        private static final double[] HOURLY_CAMPUS_PROFILE = {
                        15.0, 12.0, 10.0, 10.0, 11.0, 14.0, // 0-5 AM (low)
                        25.0, 45.0, 72.0, 85.0, 90.0, 88.0, // 6-11 AM (ramp up)
                        70.0, 65.0, 78.0, 82.0, 68.0, 45.0, // 12-5 PM (afternoon)
                        35.0, 30.0, 25.0, 22.0, 18.0, 16.0 // 6-11 PM (wind down)
        };

        // Solar generation profile (kW per kW installed, by hour)
        private static final double[] SOLAR_GENERATION_PROFILE = {
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 0-5 AM
                        0.05, 0.20, 0.50, 0.75, 0.90, 0.95, // 6-11 AM
                        1.00, 0.95, 0.85, 0.70, 0.45, 0.15, // 12-5 PM
                        0.02, 0.0, 0.0, 0.0, 0.0, 0.0 // 6-11 PM
        };

        // Building energy distribution (relative weights)
        private static final Map<String, Double> BUILDING_WEIGHTS = Map.of(
                        "Main Block", 0.20,
                        "Academic Block 1", 0.15,
                        "Academic Block 2", 0.13,
                        "Science Block", 0.12,
                        "Library Block", 0.08,
                        "Administrative Block", 0.07,
                        "Workshop Block", 0.10,
                        "Sports Complex", 0.06,
                        "Hostel Block A", 0.05,
                        "Canteen Block", 0.04);

        @Transactional
        public EnergySimulationResponse runSimulation(EnergySimulationRequest request) {
                long startTime = System.currentTimeMillis();
                String season = request.getSeason() != null ? request.getSeason() : "SUMMER";
                boolean isSummer = "SUMMER".equalsIgnoreCase(season);

                log.info("Starting energy simulation: {} season, target {}% reduction", season,
                                request.getOptimizationTarget());

                double optimPct = request.getOptimizationTarget() / 100.0;
                double costPerKwh = request.getCostPerKwh();
                double solarCapacity = request.getSolarCapacityKw();
                int forecastDays = request.getForecastDays() > 0 ? request.getForecastDays() : 30;

                // --- 1. Calculate current usage from profile ---
                double totalDailyKwh = Arrays.stream(HOURLY_CAMPUS_PROFILE).sum();
                double monthlyKwh = totalDailyKwh * 30;

                double hvacFraction = 0.40; // HVAC = 40% of campus energy
                double lightingFraction = 0.20;
                double equipmentFraction = 0.40;

                double dailyHvac = totalDailyKwh * hvacFraction;
                double dailyLighting = totalDailyKwh * lightingFraction;
                double dailyEquipment = totalDailyKwh * equipmentFraction;
                double peakDemand = Arrays.stream(HOURLY_CAMPUS_PROFILE).max().orElse(0) * 10; // scale to campus

                // Solar daily generation
                double dailySolar = 0;
                for (double factor : SOLAR_GENERATION_PROFILE) {
                        dailySolar += factor * solarCapacity;
                }

                EnergyOverview currentUsage = EnergyOverview.builder()
                                .totalConsumptionKwh(round(totalDailyKwh * forecastDays))
                                .dailyAverageKwh(round(totalDailyKwh))
                                .peakDemandKw(round(peakDemand))
                                .hvacKwh(round(dailyHvac * forecastDays))
                                .lightingKwh(round(dailyLighting * forecastDays))
                                .equipmentKwh(round(dailyEquipment * forecastDays))
                                .solarGenerationKwh(round(dailySolar * forecastDays))
                                .netConsumptionKwh(round((totalDailyKwh - dailySolar) * forecastDays))
                                .monthlyCostInr(round(monthlyKwh * costPerKwh))
                                .build();

                // --- 2. Optimized scenario (15% default reduction) ---
                double hvacSaving = Boolean.TRUE.equals(request.getIncludeHvac()) ? 0.20 : 0;
                double lightingSaving = Boolean.TRUE.equals(request.getIncludeLighting()) ? 0.30 : 0;

                // Add dynamic saving based on target optimization percentage
                if (optimPct > 0) {
                        hvacSaving = Math.max(hvacSaving, optimPct * 0.6);
                        lightingSaving = Math.max(lightingSaving, optimPct * 0.4);
                }

                double optimizedDailyHvac = dailyHvac * (1 - hvacSaving);
                double optimizedDailyLighting = dailyLighting * (1 - lightingSaving);
                double optimizedDaily = optimizedDailyHvac + optimizedDailyLighting + dailyEquipment;
                double optimizedMonthly = optimizedDaily * 30;

                EnergyOverview optimizedUsage = EnergyOverview.builder()
                                .totalConsumptionKwh(round(optimizedDaily * forecastDays))
                                .dailyAverageKwh(round(optimizedDaily))
                                .peakDemandKw(round(peakDemand * (1 - optimPct * 0.5)))
                                .hvacKwh(round(optimizedDailyHvac * forecastDays))
                                .lightingKwh(round(optimizedDailyLighting * forecastDays))
                                .equipmentKwh(round(dailyEquipment * forecastDays))
                                .solarGenerationKwh(round(dailySolar * forecastDays))
                                .netConsumptionKwh(round((optimizedDaily - dailySolar) * forecastDays))
                                .monthlyCostInr(round(optimizedMonthly * costPerKwh))
                                .build();

                // --- 3. Comparison ---
                double savingsKwh = monthlyKwh - optimizedMonthly;
                ComparisonData comparison = ComparisonData.builder()
                                .currentMonthlyKwh(round(monthlyKwh))
                                .optimizedMonthlyKwh(round(optimizedMonthly))
                                .savingsKwh(round(savingsKwh))
                                .savingsPercent(round(savingsKwh / monthlyKwh * 100))
                                .currentMonthlyCostInr(round(monthlyKwh * costPerKwh))
                                .optimizedMonthlyCostInr(round(optimizedMonthly * costPerKwh))
                                .savingsCostInr(round(savingsKwh * costPerKwh))
                                .hvacReductionPercent(round(hvacSaving * 100))
                                .lightingReductionPercent(round(lightingSaving * 100))
                                .build();

                // --- 4. Solar ROI ---
                double annualSolar = dailySolar * 365;
                double annualSavings = annualSolar * costPerKwh;
                double installationCost = solarCapacity * request.getSolarCostPerKw();
                double payback = annualSavings > 0 ? installationCost / annualSavings : 99.9;
                double twentyYearSavings = annualSavings * 20 - installationCost;
                double carbonOffset = annualSolar * 0.00082; // India grid factor: 0.82 kg CO2/kWh

                SolarROI solarAnalysis = SolarROI.builder()
                                .installedCapacityKw(solarCapacity)
                                .annualGenerationKwh(round(annualSolar))
                                .annualSavingsInr(round(annualSavings))
                                .installationCostInr(round(installationCost))
                                .paybackPeriodYears(round(payback))
                                .twentyYearSavingsInr(round(twentyYearSavings))
                                .carbonOffsetTonsPerYear(round(carbonOffset))
                                .roiPercent(round(installationCost > 0 ? (twentyYearSavings / installationCost) * 100
                                                : 0))
                                .build();

                // --- 5. Hourly trend data ---
                List<HourlyDataPoint> hourlyTrend = new ArrayList<>();
                for (int h = 0; h < 24; h++) {
                        double currentKwh = HOURLY_CAMPUS_PROFILE[h];
                        double optimizedKwh = currentKwh * (1 - optimPct);
                        double solarKwh = SOLAR_GENERATION_PROFILE[h] * solarCapacity;

                        hourlyTrend.add(HourlyDataPoint.builder()
                                        .hour(h)
                                        .label(String.format("%02d:00", h))
                                        .currentKwh(round(currentKwh))
                                        .optimizedKwh(round(optimizedKwh))
                                        .solarKwh(round(solarKwh))
                                        .build());
                }

                // --- 6. Building breakdown ---
                List<BuildingEnergy> buildingBreakdown = new ArrayList<>();
                long idCounter = 1;
                for (Map.Entry<String, Double> entry : BUILDING_WEIGHTS.entrySet()) {
                        buildingBreakdown.add(createBlockData(idCounter++, entry.getKey(),
                                        "BLK-" + idCounter,
                                        monthlyKwh * entry.getValue(),
                                        entry.getValue()));
                }
                // Sort by consumption
                buildingBreakdown.sort((b1, b2) -> b2.getConsumptionKwh().compareTo(b1.getConsumptionKwh()));

                // --- 7. Sustainability Metrics ---
                double totalCo2 = (optimizedMonthly * 12) * 0.82 / 1000; // Tons
                double totalOffset = carbonOffset;
                double netCarbon = totalCo2 - totalOffset;

                SustainabilityCard sustainability = SustainabilityCard.builder()
                                .sustainabilityScore(
                                                round(Math.min(100, (totalOffset / totalCo2) * 100 + optimPct * 50)))
                                .grade(netCarbon < 0 ? "A+" : netCarbon < 50 ? "A" : "B")
                                .carbonEmissionTons(round(totalCo2))
                                .carbonOffsetTons(round(totalOffset))
                                .netCarbonTons(round(netCarbon))
                                .renewablePercent(round((annualSolar / (optimizedMonthly * 12)) * 100))
                                .efficiencyRating(round(8.5 + optimPct * 1.5)) // 0-10 scale
                                .recommendations(List.of(
                                                "Expand solar capacity by 20% to reach carbon neutrality",
                                                "Implement HVAC scheduling to reduce off-hour consumption",
                                                "Upgrade library lighting to motion-sensor LEDs"))
                                .build();

                List<String> recommendations = new ArrayList<>();
                if (request.getOptimizationTarget() > 0) {
                        double targetReduction = request.getOptimizationTarget();
                        if (targetReduction >= 20)
                                recommendations.add("Install motion sensors in all corridors");
                        if (targetReduction >= 10)
                                recommendations.add("Shift AC setpoints by +1°C");
                        if (targetReduction >= 5)
                                recommendations.add("Enable PC sleep mode policy");
                        if (isSummer)
                                recommendations.add("Pre-cool auditorium during off-peak hours");
                }

                long execTime = System.currentTimeMillis() - startTime;
                String summary = String.format(
                                "Simulated %d days. Est. Consumption: %.0f kWh (saved %.1f%%). Solar covers %.1f%% of demand.",
                                forecastDays, optimizedMonthly, comparison.getSavingsPercent(),
                                sustainability.getRenewablePercent());

                SimulationResult simResult = saveResult(request, summary, execTime);

                return EnergySimulationResponse.builder()
                                .simulationId(simResult.getId())
                                .status("COMPLETED")
                                .executionTimeMs(execTime)
                                .summary(summary)
                                .currentUsage(currentUsage)
                                .optimizedUsage(optimizedUsage)
                                .comparison(comparison)
                                .solarAnalysis(solarAnalysis)
                                .hourlyTrend(hourlyTrend)
                                .buildingBreakdown(buildingBreakdown)
                                .sustainability(sustainability)
                                .recommendations(recommendations)
                                .build();
        }

        @Transactional(readOnly = true)
        public EnergySimulationResponse getAnalytics() {
                return runSimulation(new EnergySimulationRequest());
        }

        private BuildingEnergy createBlockData(Long id, String name, String code, double consumption,
                        double percentageVal) {
                return BuildingEnergy.builder()
                                .buildingId(id)
                                .buildingName(name)
                                .buildingCode(code)
                                .consumptionKwh(round(consumption))
                                .percentage(round(percentageVal * 100))
                                .peakDemandKw(round(consumption / (30 * 12))) // Approx peak
                                .build();
        }

        private SimulationResult saveResult(EnergySimulationRequest req, String summary, long execTime) {
                try {
                        SimulationResult result = SimulationResult.builder()
                                        .simulationType(SimulationType.ENERGY_FORECAST)
                                        .simulationName("Energy Sim - "
                                                        + (req.getSeason() != null ? req.getSeason() : "DEFAULT"))
                                        .inputParams(objectMapper.writeValueAsString(req))
                                        .outputData("{}")
                                        .summary(summary)
                                        .executionTimeMs(execTime)
                                        .status(SimulationStatus.COMPLETED)
                                        .startedAt(LocalDateTime.now().minus(execTime, ChronoUnit.MILLIS))
                                        .completedAt(LocalDateTime.now())
                                        .build();
                        return simulationResultRepository.save(result);
                } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to serialize energy simulation", e);
                }
        }

        private double round(double v) {
                return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
        }
}
