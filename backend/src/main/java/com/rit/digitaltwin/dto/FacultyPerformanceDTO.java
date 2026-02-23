package com.rit.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacultyPerformanceDTO {
    private String facultyName;
    private String departmentName;
    private Double averageClassPassRate;
    private Double studentFeedbackScore; // Simulated
}
