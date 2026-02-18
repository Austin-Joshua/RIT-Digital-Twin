package com.rit.digitaltwin.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClassroomSimulationRequest {

    @NotNull(message = "Student count is required")
    @Min(value = 1, message = "Student count must be at least 1")
    @Max(value = 500, message = "Student count cannot exceed 500")
    private Integer studentCount;

    private String department;

    private String dayOfWeek;

    private String startTime;

    private String endTime;

    private String roomType;

    private Boolean requireAc;

    private Boolean requireProjector;

    private Boolean requireSmartBoard;
}
