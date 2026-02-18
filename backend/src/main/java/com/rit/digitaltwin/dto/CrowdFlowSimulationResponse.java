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
public class CrowdFlowSimulationResponse {

    private Long simulationId;
    private String status;
    private Long executionTimeMs;
    private String summary;
    private String scenario;

    private CampusOverview campusOverview;
    private EvacuationAnalysis evacuation;
    private List<ZoneData> zones;
    private List<CongestionPoint> congestionPoints;
    private EmergencyReadiness readiness;
    private List<HourlyFlow> hourlyFlow;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampusOverview {
        private Integer totalOccupancy;
        private Integer totalCapacity;
        private Double occupancyPercent;
        private Integer totalZones;
        private Integer congestionZones;
        private Integer safeZones;
        private Double avgDensityPerSqm;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvacuationAnalysis {
        private Double estimatedEvacuationTimeSec;
        private Double estimatedEvacuationTimeMin;
        private Integer exitGatesAvailable;
        private Double flowRatePersonsPerSec;
        private Double bottleneckDelayPct;
        private String emergencyType;
        private String evacuationRating;
        private List<ExitGateDetail> exitGates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExitGateDetail {
        private String gateName;
        private Integer capacity;
        private Integer assignedPeople;
        private Double evacuationTimeSec;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneData {
        private String zoneId;
        private String zoneName;
        private String buildingName;
        private Integer floor;
        private Integer currentOccupancy;
        private Integer maxCapacity;
        private Double occupancyPercent;
        private Double densityPerSqm;
        private String congestionLevel;
        private Double heatmapIntensity;
        private Double areaSquareMeters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CongestionPoint {
        private String location;
        private String type;
        private Double severity;
        private Integer affectedPeople;
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyReadiness {
        private Double overallScore;
        private String grade;
        private Double evacuationScore;
        private Double signageScore;
        private Double exitAccessScore;
        private Double drillFrequencyScore;
        private Double fireEquipmentScore;
        private List<String> strengths;
        private List<String> improvements;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyFlow {
        private Integer hour;
        private String label;
        private Integer occupancy;
        private Integer inflow;
        private Integer outflow;
        private Double congestionIndex;
    }
}
