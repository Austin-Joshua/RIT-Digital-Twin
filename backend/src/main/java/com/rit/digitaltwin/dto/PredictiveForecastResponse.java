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
public class PredictiveForecastResponse {

    private String forecastPeriod;
    private String generatedAt;
    private String modelType;
    private Double confidenceLevel;
    private String summary;

    private EnrollmentForecast enrollment;
    private InfrastructureDemand infrastructure;
    private EnergyForecast energy;
    private TransportForecast transport;
    private List<SemesterTrend> historicalTrend;
    private List<RiskFactor> risks;
    private List<String> recommendations;

    // Generic Forecast Fields
    private String metric;
    private Integer forecastHorizonMonths;
    private String trendDirection;
    private Double predictedGrowthRate;
    private Double confidenceScore;
    private List<ForecastPoint> forecastData;
    private List<String> keyInsights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastPoint {
        private Integer monthIndex;
        private Double value;
        private Double lowerBound;
        private Double upperBound;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentForecast {
        private Integer currentEnrollment;
        private Integer predictedEnrollment;
        private Double growthPercent;
        private Integer newIntake;
        private Integer graduatingBatch;
        private List<DepartmentForecast> departments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentForecast {
        private String department;
        private Integer current;
        private Integer predicted;
        private Double growthPercent;
        private String trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfrastructureDemand {
        private Integer currentClassrooms;
        private Integer requiredClassrooms;
        private Integer shortfall;
        private Integer currentLabs;
        private Integer requiredLabs;
        private Integer labShortfall;
        private Double peakOccupancyPercent;
        private Double predictedUtilization;
        private List<FacilityNeed> facilityNeeds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityNeed {
        private String facility;
        private String status;
        private Integer currentCapacity;
        private Integer requiredCapacity;
        private String priority;
        private String action;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnergyForecast {
        private Double currentMonthlyKwh;
        private Double predictedMonthlyKwh;
        private Double increasePercent;
        private Double predictedPeakKw;
        private Double solarCoveragePercent;
        private Double estimatedMonthlyCostInr;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransportForecast {
        private Integer currentStudentsServed;
        private Integer predictedStudentsServed;
        private Integer currentRoutes;
        private Integer requiredRoutes;
        private Integer additionalBuses;
        private Double predictedFuelLitresDaily;
        private Double costIncreasePercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemesterTrend {
        private String semester;
        private Integer enrollment;
        private Double classroomUtil;
        private Double energyKwh;
        private Integer transportStudents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskFactor {
        private String risk;
        private String category;
        private String severity;
        private Double probability;
        private String mitigation;
    }
}
