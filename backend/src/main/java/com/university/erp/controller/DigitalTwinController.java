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
public class DigitalTwinController {

    private final CrowdFlowService crowdFlowService;
    private final EnergyForecastingService energyForecastingService;
    private final ResourceUtilizationService resourceUtilizationService;
    private final ScenarioSimulationService scenarioSimulationService;
    private final PredictiveEngine predictiveEngine;
    private final CampusCommandService campusCommandService;
    private final CampusSpatialService campusSpatialService;
    private final CampusStateService campusStateService;
    private final SimulatedSourceService simulatedSourceService;

    @GetMapping("/spatial")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> spatial(@RequestParam(defaultValue = "NOW") String horizon) {
        return ResponseEntity.ok(campusSpatialService.index(horizon));
    }

    @GetMapping("/spatial/buildings/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<Map<String, Object>> spatialBuilding(@PathVariable Long id,
                                                               @RequestParam(defaultValue = "NOW") String horizon) {
        return campusSpatialService.building(id, horizon)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("because", "Building was not found.")));
    }

    @GetMapping("/spatial/rooms/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<Map<String, Object>> spatialRoom(@PathVariable Long id,
                                                           @RequestParam(defaultValue = "NOW") String horizon) {
        return campusSpatialService.room(id, horizon)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("because", "Room was not found.")));
    }

    @GetMapping("/state")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<Map<String, Object>> campusState() {
        return ResponseEntity.ok(campusStateService.current());
    }

    @GetMapping("/sources")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<Map<String, Object>> simulatedSources() {
        return ResponseEntity.ok(simulatedSourceService.snapshot());
    }

    @GetMapping("/command")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> commandSnapshot() {
        Object command = campusStateService.current().get("command");
        if (command instanceof Map<?, ?> map) {
            return ResponseEntity.ok(copy(map));
        }
        return ResponseEntity.ok(campusCommandService.snapshot());
    }

    private static Map<String, Object> copy(Map<?, ?> map) {
        Map<String, Object> copy = new java.util.LinkedHashMap<>();
        map.forEach((key, value) -> copy.put(String.valueOf(key), value));
        return copy;
    }

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

    @GetMapping("/simulate-scenario")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<Map<String, Object>> simulationCatalog() {
        return ResponseEntity.ok(scenarioSimulationService.catalog());
    }

    @PostMapping("/simulate-scenario")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<Map<String, Object>> runScenario(@RequestBody Map<String, Object> params) {
        return ResponseEntity.ok(scenarioSimulationService.simulate(params));
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
