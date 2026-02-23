package com.rit.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CgpaSimulationResponse {
    private double currentCgpa;
    private double projectedSgpa;
    private double projectedCgpa;
    private String trend; // "IMPROVING", "DECLINING", "STABLE"
}
