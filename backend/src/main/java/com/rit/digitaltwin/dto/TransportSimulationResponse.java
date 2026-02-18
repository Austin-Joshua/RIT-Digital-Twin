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
public class TransportSimulationResponse {

    private Long simulationId;
    private String status;
    private Long executionTimeMs;
    private String summary;

    private FleetOverview fleetOverview;
    private FuelAnalysis fuelAnalysis;
    private OptimizationResult optimization;
    private List<RouteDetail> routes;
    private List<StudentCluster> clusters;
    private EvScenario evScenario;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FleetOverview {
        private Integer totalRoutes;
        private Integer totalVehicles;
        private Integer totalStudents;
        private Double totalDistanceKm;
        private Double averageOccupancyPercent;
        private Double totalDailyTripsKm;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FuelAnalysis {
        private Double dailyFuelLitres;
        private Double monthlyFuelLitres;
        private Double dailyCostInr;
        private Double monthlyCostInr;
        private Double avgFuelPerStudent;
        private Double co2EmissionsKgDaily;
        private Double co2EmissionsKgMonthly;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptimizationResult {
        private Double optimizationScore;
        private Double currentEfficiency;
        private Double optimizedEfficiency;
        private Double fuelReductionPercent;
        private Double fuelSavingsLitres;
        private Double costSavingsInr;
        private Double co2ReductionKg;
        private Integer routesMerged;
        private Integer stopsOptimized;
        private List<String> recommendations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteDetail {
        private String routeCode;
        private String routeName;
        private String origin;
        private String destination;
        private Double distanceKm;
        private Integer durationMin;
        private Integer stops;
        private Integer students;
        private Integer vehicleCapacity;
        private Double occupancyPercent;
        private Double fuelLitres;
        private Double efficiencyScore;
        private String vehicleType;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentCluster {
        private String zoneName;
        private String area;
        private Integer studentCount;
        private Double distanceFromCampusKm;
        private Double percentage;
        private String assignedRoute;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvScenario {
        private Integer evReplacements;
        private Double annualFuelSavingsInr;
        private Double evPurchaseCostInr;
        private Double paybackYears;
        private Double co2ReductionPercent;
        private Double electricityCostInr;
        private Double netSavingsInr;
    }
}
