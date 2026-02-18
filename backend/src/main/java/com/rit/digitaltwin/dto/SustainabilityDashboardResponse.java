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
public class SustainabilityDashboardResponse {

    private Double compositeIndex;
    private String compositeGrade;
    private String lastUpdated;
    private String summary;

    private EnergyScore energy;
    private TransportScore transport;
    private InfrastructureScore infrastructure;
    private CarbonFootprint carbon;
    private List<TrendPoint> monthlyTrend;
    private List<GoalTracker> sdgGoals;
    private List<Initiative> activeInitiatives;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnergyScore {
        private Double score;
        private String grade;
        private Double totalConsumptionKwh;
        private Double renewablePercent;
        private Double efficiencyGain;
        private Double peakDemandKw;
        private Double solarGenerationKwh;
        private Double costPerSqft;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransportScore {
        private Double score;
        private String grade;
        private Double fleetEfficiency;
        private Double avgOccupancyPercent;
        private Double fuelPerStudentLitres;
        private Double co2PerStudentKg;
        private Double evAdoptionPercent;
        private Integer routesOptimized;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfrastructureScore {
        private Double score;
        private String grade;
        private Double classroomUtilizationPercent;
        private Double labUtilizationPercent;
        private Double facilityOccupancyPercent;
        private Double spaceEfficiencyIndex;
        private Double maintenanceResponseHrs;
        private Integer digitalizedRooms;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonFootprint {
        private Double totalCo2TonsYear;
        private Double perCapitaCo2Kg;
        private Double reductionFromBaseline;
        private Double scope1Tons;
        private Double scope2Tons;
        private Double scope3Tons;
        private Double offsetTons;
        private Double netEmissions;
        private String neutralityTarget;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendPoint {
        private String month;
        private Double energy;
        private Double transport;
        private Double infrastructure;
        private Double composite;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalTracker {
        private String sdgNumber;
        private String sdgTitle;
        private Double progress;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Initiative {
        private String name;
        private String category;
        private Double progressPercent;
        private String impact;
        private String deadline;
        private String status;
    }
}
