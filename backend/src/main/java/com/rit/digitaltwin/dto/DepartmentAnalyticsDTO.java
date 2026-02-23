package com.rit.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentAnalyticsDTO {
    private String departmentName;
    private Double averageCgpa;
    private Double passPercentage;
    private Integer totalStudents;
}
