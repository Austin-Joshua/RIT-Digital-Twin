package com.rit.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GrowthPassportResponse {
    private Double currentCgpa;
    private Double attendancePercentage;
    private Double internalPerformance;
    private Double placementReadinessScore;

    // For Radar Chart
    private Double academicStrength;
    private Double practicalSkills;
    private Double attendanceConsistency;
    private Double performanceImprovement;

    private List<String> skills;
    private int projectsCompleted;
    private int internshipsCompleted;
}
