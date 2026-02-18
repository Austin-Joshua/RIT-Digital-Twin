package com.rit.digitaltwin.dto;

import lombok.Data;

import java.util.List;

@Data
public class TransportSimulationRequest {

    /** Number of routes to simulate (default: all campus routes) */
    private Integer routeCount = 12;

    /** Total students to allocate across routes */
    private Integer totalStudents = 2800;

    /** Fuel cost per litre in INR */
    private Double fuelCostPerLitre = 100.0;

    /** Target optimization percentage */
    private Double optimizationTarget = 20.0;

    /** Include electric vehicle scenario */
    private Boolean includeEvScenario = true;

    /** Custom origins (optional for cluster mapping) */
    private List<String> studentOrigins;
}
