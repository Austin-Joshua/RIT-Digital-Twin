package com.rit.digitaltwin.service;

import com.rit.digitaltwin.analytics.SustainabilityCalculator;
import com.rit.digitaltwin.dto.SustainabilityDashboardResponse;
import com.rit.digitaltwin.dto.SustainabilityDashboardResponse.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SustainabilityService {

        private final SustainabilityCalculator calculator;

        /**
         * Generates a comprehensive sustainability dashboard combining
         * energy, transport, infrastructure, and carbon footprint metrics
         * into a composite sustainability index.
         */
        public SustainabilityDashboardResponse getDashboard() {
                log.info("Generating sustainability dashboard");

                // These values would normally come from other services or DB
                // For now we use hardcoded snapshots or we could call other services

                // Energy Data
                double totalKwh = 285000;
                double renewablePct = 18.5;
                double efficiencyGain = 14.2;
                double peakDemand = 1200;
                double solarGen = 52750;
                double costPerSqft = 4.8;

                EnergyScore energy = calculator.computeEnergyScore(totalKwh, renewablePct, efficiencyGain, peakDemand,
                                solarGen, costPerSqft);

                // Transport Data
                double fleetEfficiency = 72.5;
                double avgOccupancy = 78.0;
                double fuelPerStudent = 1.8;
                double co2PerStudent = 4.82;
                double evAdoption = 8.3;
                int routesOptimized = 9;

                TransportScore transport = calculator.computeTransportScore(fleetEfficiency, avgOccupancy,
                                fuelPerStudent, co2PerStudent, evAdoption, routesOptimized);

                // Infra Data
                double classroomUtil = 68.5;
                double labUtil = 72.0;
                double facilityOcc = 61.3;
                double spaceEfficiency = 0.78;
                double maintenanceResp = 4.2;
                int digitalizedRooms = 42;

                InfrastructureScore infra = calculator.computeInfrastructureScore(classroomUtil, labUtil, facilityOcc,
                                spaceEfficiency, maintenanceResp, digitalizedRooms);

                // Carbon Data
                double scope1 = 420;
                double scope2 = 890;
                double scope3 = 350;
                double offsets = 280;
                double baselineTotal = 2100;

                CarbonFootprint carbon = calculator.computeCarbonFootprint(scope1, scope2, scope3, offsets,
                                baselineTotal);

                // Composite index
                double compositeIndex = round(
                                energy.getScore() * 0.30 +
                                                transport.getScore() * 0.25 +
                                                infra.getScore() * 0.25 +
                                                (carbon.getReductionFromBaseline() * 1.5 + carbon.getOffsetTons()
                                                                / carbon.getTotalCo2TonsYear() * 100) * 0.20 // Approx
                                                                                                             // score
                                                                                                             // logic
                );
                compositeIndex = Math.min(100, compositeIndex); // Clamp

                String compositeGrade = calculator.toGrade(compositeIndex);

                String summary = String.format(
                                "RIT campus composite sustainability index: %.1f/100 (%s). " +
                                                "Energy: %.0f | Transport: %.0f | Infrastructure: %.0f | Carbon: %.0f. "
                                                +
                                                "Net emissions: %.0f tons CO₂/year with %.0f%% reduction from baseline.",
                                compositeIndex, compositeGrade,
                                energy.getScore(), transport.getScore(), infra.getScore(),
                                carbon.getReductionFromBaseline(), // Using reduction as proxy for score in summary
                                carbon.getNetEmissions(), carbon.getReductionFromBaseline());

                return SustainabilityDashboardResponse.builder()
                                .compositeIndex(compositeIndex)
                                .compositeGrade(compositeGrade)
                                .lastUpdated(LocalDate.now().format(DateTimeFormatter.ISO_DATE))
                                .summary(summary)
                                .energy(energy)
                                .transport(transport)
                                .infrastructure(infra)
                                .carbon(carbon)
                                .monthlyTrend(generateMonthlyTrend())
                                .sdgGoals(generateSdgGoals())
                                .activeInitiatives(generateInitiatives())
                                .build();
        }

        // ============================================================
        // MONTHLY TREND (12 months)
        // ============================================================
        private List<TrendPoint> generateMonthlyTrend() {
                String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
                                "Dec" };
                double[][] data = {
                                // energy, transport, infra, composite
                                { 62, 58, 55, 58 }, { 63, 59, 56, 59 }, { 65, 60, 58, 61 },
                                { 66, 62, 59, 62 }, { 68, 63, 61, 64 }, { 70, 65, 62, 66 },
                                { 71, 66, 64, 67 }, { 72, 68, 65, 68 }, { 74, 69, 67, 70 },
                                { 75, 71, 68, 71 }, { 76, 72, 70, 73 }, { 78, 74, 72, 75 }
                };

                return java.util.stream.IntStream.range(0, 12).mapToObj(i -> TrendPoint.builder()
                                .month(months[i])
                                .energy(data[i][0])
                                .transport(data[i][1])
                                .infrastructure(data[i][2])
                                .composite(data[i][3])
                                .build()).toList();
        }

        // ============================================================
        // SDG GOALS (UN Sustainable Development Goals)
        // ============================================================
        private List<GoalTracker> generateSdgGoals() {
                return List.of(
                                GoalTracker.builder().sdgNumber("7").sdgTitle("Affordable & Clean Energy")
                                                .progress(65.0)
                                                .status("ON_TRACK").build(),
                                GoalTracker.builder().sdgNumber("9").sdgTitle("Industry, Innovation & Infrastructure")
                                                .progress(58.0)
                                                .status("ON_TRACK").build(),
                                GoalTracker.builder().sdgNumber("11").sdgTitle("Sustainable Cities & Communities")
                                                .progress(72.0)
                                                .status("AHEAD").build(),
                                GoalTracker.builder().sdgNumber("12").sdgTitle("Responsible Consumption & Production")
                                                .progress(45.0)
                                                .status("NEEDS_ATTENTION").build(),
                                GoalTracker.builder().sdgNumber("13").sdgTitle("Climate Action").progress(52.0)
                                                .status("ON_TRACK")
                                                .build());
        }

        // ============================================================
        // ACTIVE INITIATIVES
        // ============================================================
        private List<Initiative> generateInitiatives() {
                return List.of(
                                Initiative.builder().name("500 kW Solar Rooftop Expansion").category("Energy")
                                                .progressPercent(72.0)
                                                .impact("Reduce grid dependency by 35%").deadline("Dec 2026")
                                                .status("IN_PROGRESS").build(),
                                Initiative.builder().name("Electric Bus Fleet Phase-1").category("Transport")
                                                .progressPercent(25.0)
                                                .impact("Replace 4 diesel buses, save ₹18L/year").deadline("Aug 2027")
                                                .status("PLANNED")
                                                .build(),
                                Initiative.builder().name("Smart LED Retrofit").category("Energy").progressPercent(88.0)
                                                .impact("30% lighting energy reduction").deadline("Mar 2026")
                                                .status("NEAR_COMPLETE").build(),
                                Initiative.builder().name("IoT Occupancy Sensors").category("Infrastructure")
                                                .progressPercent(40.0)
                                                .impact("Optimize HVAC based on real occupancy").deadline("Jun 2026")
                                                .status("IN_PROGRESS")
                                                .build(),
                                Initiative.builder().name("Rainwater Harvesting Phase-2").category("Water")
                                                .progressPercent(60.0)
                                                .impact("Supplement 20% of water needs").deadline("Sep 2026")
                                                .status("IN_PROGRESS").build(),
                                Initiative.builder().name("Campus Tree Plantation Drive").category("Carbon Offset")
                                                .progressPercent(90.0)
                                                .impact("Offset 80 tons CO₂/year").deadline("Feb 2026")
                                                .status("NEAR_COMPLETE").build());
        }

        private double round(double v) {
                return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
        }
}
