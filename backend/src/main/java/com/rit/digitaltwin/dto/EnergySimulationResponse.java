package com.rit.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergySimulationResponse {

    private Long simulationId;
    private String status;
    private Long executionTimeMs;
    private String summary;
    private List<String> recommendations;

    // Current usage analytics
    private EnergyOverview currentUsage;

    // Optimized scenario
    private EnergyOverview optimizedUsage;

    // Before vs After comparison
    private ComparisonData comparison;

    // Solar ROI analysis
    private SolarROI solarAnalysis;

    // Hourly trend data for charts
    private List<HourlyDataPoint> hourlyTrend;

    // Building-wise breakdown
    private List<BuildingEnergy> buildingBreakdown;

    // Sustainability metrics
    private SustainabilityCard sustainability;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnergyOverview {
        private Double totalConsumptionKwh;
        private Double dailyAverageKwh;
        private Double peakDemandKw;
        private Double hvacKwh;
        private Double lightingKwh;
        private Double equipmentKwh;
        private Double solarGenerationKwh;
        private Double netConsumptionKwh;
        private Double monthlyCostInr;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonData {
        private Double currentMonthlyKwh;
        private Double optimizedMonthlyKwh;
        private Double savingsKwh;
        private Double savingsPercent;
        private Double currentMonthlyCostInr;
        private Double optimizedMonthlyCostInr;
        private Double savingsCostInr;
        private Double hvacReductionPercent;
        private Double lightingReductionPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SolarROI {
        private Double installedCapacityKw;
        private Double annualGenerationKwh;
        private Double annualSavingsInr;
        private Double installationCostInr;
        private Double paybackPeriodYears;
        private Double twentyYearSavingsInr;
        private Double carbonOffsetTonsPerYear;
        private Double roiPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyDataPoint {
        private Integer hour;
        private String label;
        private Double currentKwh;
        private Double optimizedKwh;
        private Double solarKwh;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuildingEnergy {
        private Long buildingId;
        private String buildingName;
        private String buildingCode;
        private Double consumptionKwh;
        private Double percentage;
        private Double peakDemandKw;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SustainabilityCard {
        private Double sustainabilityScore;
        private String grade;
        private Double carbonEmissionTons;
        private Double carbonOffsetTons;
        private Double netCarbonTons;
        private Double renewablePercent;
        private Double efficiencyRating;
        private List<String> recommendations;
    }
}
