package com.rit.digitaltwin.dto;

import lombok.Data;

@Data
public class EnergySimulationRequest {

    private Long buildingId;

    private String buildingName;

    /** Number of days to forecast (default: 30) */
    private Integer forecastDays = 30;

    /** Optimization target percentage (default: 15%) */
    private Double optimizationTarget = 15.0;

    /** Solar panel capacity in kW for ROI calculation */
    private Double solarCapacityKw = 100.0;

    /** Cost per kWh in INR */
    private Double costPerKwh = 8.0;

    /** Solar installation cost per kW in INR */
    private Double solarCostPerKw = 50000.0;

    /** Include HVAC optimization */
    private Boolean includeHvac = true;

    /** Include lighting optimization */
    private Boolean includeLighting = true;

    private String season = "SUMMER";
    private Double roofArea = 5000.0;
    private Double solarPanelEfficiency = 18.0;
}
