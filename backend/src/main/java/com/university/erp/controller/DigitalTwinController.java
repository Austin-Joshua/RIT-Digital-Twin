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
    private final IoTIngestionGatewayService ioTIngestionGatewayService;
    private final IoTTimeSeriesRollupService ioTTimeSeriesRollupService;
    private final SyntheticTelemetryEngine syntheticTelemetryEngine;
    private final CampusMissionService campusMissionService;

    @PostMapping("/iot/ingest")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<Map<String, Object>> ingestSensorData(@RequestBody com.university.erp.dto.IoTSensorTelemetryDto telemetry) {
        return ResponseEntity.ok(ioTIngestionGatewayService.ingestTelemetry(telemetry));
    }

    @GetMapping("/iot/live")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<com.university.erp.dto.IoTSensorTelemetryDto>> liveSensorSnapshot() {
        return ResponseEntity.ok(ioTIngestionGatewayService.getLiveSnapshot());
    }

    @GetMapping("/iot/rollup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getRollup(
            @RequestParam String metricType,
            @RequestParam String locationCode) {
        return ResponseEntity.ok(ioTTimeSeriesRollupService.getRollupFor(metricType, locationCode));
    }

    @GetMapping("/iot/rollup-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRollupStats() {
        return ResponseEntity.ok(ioTTimeSeriesRollupService.getRollupStats());
    }

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

    @GetMapping({"/simulate-scenario", "/scenarios/catalog"})
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> simulationCatalog() {
        return ResponseEntity.ok(scenarioSimulationService.catalog());
    }

    @PostMapping({"/simulate-scenario", "/scenarios/simulate"})
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<Map<String, Object>> runScenario(@RequestBody Map<String, Object> params) {
        return ResponseEntity.ok(scenarioSimulationService.simulate(params));
    }

    @PostMapping("/scenarios/preview")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> previewScenario(@RequestBody Map<String, Object> params) {
        return ResponseEntity.ok(scenarioSimulationService.preview(params));
    }

    @GetMapping("/scenarios/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<List<Map<String, Object>>> scenarioHistory() {
        return ResponseEntity.ok(scenarioSimulationService.history());
    }

    @PostMapping("/scenarios/sweep")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY')")
    public ResponseEntity<Map<String, Object>> parameterSweep(@RequestBody Map<String, Object> body) {
        String parameter = String.valueOf(body.getOrDefault("parameter", "hvacEfficiencyPercent"));
        int min = body.get("min") instanceof Number n ? n.intValue() : 0;
        int max = body.get("max") instanceof Number n ? n.intValue() : 40;
        int step = body.get("step") instanceof Number n ? n.intValue() : 5;
        @SuppressWarnings("unchecked")
        Map<String, Object> base = (Map<String, Object>) body.get("baseScenario");
        return ResponseEntity.ok(scenarioSimulationService.sweep(parameter, min, max, step, base));
    }

    @GetMapping("/telemetry/synthetic")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> syntheticTelemetry(
            @RequestParam(defaultValue = "normal-day") String scenario,
            @RequestParam(defaultValue = "ENERGY") String metric,
            @RequestParam(defaultValue = "8") int startHour,
            @RequestParam(defaultValue = "18") int endHour,
            @RequestParam(defaultValue = "30") int stepMinutes) {
        return ResponseEntity.ok(syntheticTelemetryEngine.generateTimeSeries(scenario, metric, startHour, endHour, stepMinutes));
    }

    @GetMapping({"/iot/campus-overview", "/overview"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> campusOverview(
            @RequestParam(required = false) String scenario,
            @RequestParam(required = false) String clock) {
        java.time.LocalTime parsedClock = clock != null ? java.time.LocalTime.parse(clock) : null;
        return ResponseEntity.ok(syntheticTelemetryEngine.getCampusOverview(scenario, parsedClock));
    }

    @GetMapping("/missions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CampusMissionService.MissionDef>> missions() {
        return ResponseEntity.ok(campusMissionService.getMissions());
    }

    @PostMapping("/missions/evaluate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> evaluateMission(
            @RequestParam String missionId,
            @RequestBody(required = false) Map<String, Object> candidateAdjustments) {
        return ResponseEntity.ok(campusMissionService.evaluateMission(missionId, candidateAdjustments));
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
