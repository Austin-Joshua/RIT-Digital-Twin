package com.rit.digitaltwin.dto;

import lombok.Data;

@Data
public class CrowdFlowSimulationRequest {

    /** Total number of people on campus */
    private Integer totalOccupancy = 5000;

    /** Scenario type: NORMAL, PEAK_HOUR, EMERGENCY_EVACUATION, EVENT */
    private String scenario = "NORMAL";

    /** Specific building to simulate (optional, null = entire campus) */
    private Long buildingId;

    /** Time of day (for peak-hour pattern): HH:mm */
    private String timeOfDay = "10:00";

    /** Number of exit gates available */
    private Integer exitGates = 4;

    /** Emergency type: FIRE, EARTHQUAKE, FLOOD, BOMB_THREAT */
    private String emergencyType = "FIRE";

    /** Include evacuation drill analysis */
    private Boolean includeEvacuation = true;
}
