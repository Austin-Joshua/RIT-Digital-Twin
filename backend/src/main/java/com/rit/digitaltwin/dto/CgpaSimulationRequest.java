package com.rit.digitaltwin.dto;

import lombok.Data;
import java.util.Map;

@Data
public class CgpaSimulationRequest {
    private Long studentId;
    private int currentCompletedCredits;
    private Map<Long, Integer> expectedGrades; // Subject ID -> Grade Point
}
