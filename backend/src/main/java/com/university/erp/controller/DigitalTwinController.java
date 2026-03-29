package com.university.erp.controller;

import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/twin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DigitalTwinController {

    private final CrowdFlowService crowdFlowService;
    private final EnergyForecastingService energyForecastingService;
    private final ResourceUtilizationService resourceUtilizationService;
    private final ScenarioSimulationService scenarioSimulationService;
    private final PredictiveEngine predictiveEngine;

    @GetMapping("/crowd-density")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<DigitalTwinMetrics>> getCrowdDensity(@RequestParam String day, @RequestParam String slot) {
        return ResponseEntity.ok(crowdFlowService.simulateCrowdFlow(day, slot));
    }

    @GetMapping("/energy-forecast")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<List<DigitalTwinMetrics>> getEnergyForecast(@RequestParam String day) {
        return ResponseEntity.ok(energyForecastingService.forecastBuildingEnergy(day));
    }

    @GetMapping("/utilization")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<List<DigitalTwinMetrics>> getResourceUtilization() {
        return ResponseEntity.ok(resourceUtilizationService.analyzeResourceUtilization());
    }

    @PostMapping("/simulate-scenario")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLANNING')")
    public ResponseEntity<List<DigitalTwinMetrics>> runScenario(@RequestBody Map<String, Object> params) {
        String name = (String) params.getOrDefault("scenarioName", "Unnamed Scenario");
        int intake = (int) params.getOrDefault("intakeAdjustment", 0);
        return ResponseEntity.ok(scenarioSimulationService.runWhatIfScenario(name, intake));
    }

    @GetMapping("/predictions/congestion")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getCongestionPrediction() {
        return ResponseEntity.ok(predictiveEngine.predictNextWeekTrends());
    }

    @GetMapping("/predictions/energy")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<Map<String, Object>> getEnergyPrediction() {
        return ResponseEntity.ok(predictiveEngine.projectEnergyDemand());
    }
}
