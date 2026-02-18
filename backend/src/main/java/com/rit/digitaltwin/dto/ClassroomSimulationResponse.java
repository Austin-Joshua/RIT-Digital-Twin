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
public class ClassroomSimulationResponse {

    private Long simulationId;
    private String status;
    private Long executionTimeMs;
    private Integer totalRoomsEvaluated;
    private Integer totalRecommendations;
    private String summary;
    private ClassroomSimulationRequest inputParameters;
    private List<ClassroomRecommendation> recommendations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassroomRecommendation {
        private Long classroomId;
        private String roomNumber;
        private String buildingName;
        private String buildingCode;
        private Integer floor;
        private Integer capacity;
        private String roomType;
        private Boolean hasProjector;
        private Boolean hasAc;
        private Boolean hasSmartBoard;
        private Boolean hasWifi;
        private Double utilizationPercent;
        private Integer wastedCapacity;
        private Double suitabilityScore;
        private String availabilityStatus;
        private List<String> conflictingSlots;
    }
}
