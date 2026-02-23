package com.rit.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DepartmentAnalyticsDTO {
    private String departmentName;
    private Double averageCgpa;
    private Double passPercentage;
    private Integer totalStudents;

    // New fields
    private Double avgAttendance;
    private Double placementReadinessIndex;
    private Map<String, Long> riskDistribution; // "LOW", "MEDIUM", "HIGH"
    private Map<String, Long> attendanceRangeDistribution; // "<75", "75-85", ">85"
}
