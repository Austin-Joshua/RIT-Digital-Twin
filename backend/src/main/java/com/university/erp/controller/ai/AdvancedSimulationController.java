package com.university.erp.controller.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.erp.intelligence.Provenance;
import com.university.erp.intelligence.SimulationResult;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdvancedSimulationController {

    private final AiService aiService;
    private final ObjectMapper objectMapper;

    @PostMapping("/simulate/transport")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> simulateTransport(@RequestBody Map<String, Object> payload)
            throws JsonProcessingException {
        int routeCount = intVal(payload.get("routeCount"), 8);
        int totalStudents = intVal(payload.get("totalStudents"), 2000);
        int fuelCost = intVal(payload.get("fuelCostPerLitre"), 100);
        int optimizationTarget = intVal(payload.get("optimizationTarget"), 20);
        boolean includeEv = boolVal(payload.get("includeEvScenario"), true);

        Map<String, Object> result = aiService.simulateTransport(routeCount, totalStudents, fuelCost, optimizationTarget, includeEv);
        return simulated(result);
    }

    @PostMapping("/energy/optimize/{buildingId}")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> optimizeEnergy(@PathVariable Long buildingId) throws JsonProcessingException {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("buildingId", buildingId);
        result.put("available", false);
        result.put("currentUsageAvg", null);
        result.put("projectedUsage", null);
        result.put("savings", null);
        result.put("recommendations", List.of("No energy optimization is available. No meter history is stored for this building."));
        return simulated(result);
    }

    @PostMapping("/crowd/simulate")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> simulateCrowd(@RequestBody Map<String, Object> payload)
            throws JsonProcessingException {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("available", false);
        out.put("congestionLevel", null);
        out.put("estimatedEvacuationTimeMin", null);
        out.put("readinessScore", null);
        out.put("because", "No evacuation model is stored. Occupancy input is not turned into a readiness score.");
        return simulated(out);
    }

    @PostMapping("/classrooms/simulate")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> simulateClassroom(@RequestBody Map<String, Object> payload)
            throws JsonProcessingException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("available", false);
        body.put("rooms", List.of());
        body.put("resultJson", objectMapper.writeValueAsString(List.of()));
        body.put("source", SourceClass.SIMULATED.name());
        body.put("because", "No classroom fit is calculated here. Room identity must come from the classroom inventory, not a generated list.");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/analytics/predictions")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> analyticsPredictions() {
        return ResponseEntity.ok(Provenance.stamp(aiService.predictAnalytics(), SourceClass.PREDICTED,
                "Static planning narrative. Not computed from current meter or attendance rows."));
    }

    @GetMapping("/analytics/sustainability")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> sustainabilitySnapshot() {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("available", false);
        snapshot.put("source", SourceClass.ESTIMATED.name());
        snapshot.put("because", "No utility, carbon, water, or waste ledger is stored.");
        snapshot.put("kpis", List.of());
        snapshot.put("carbonData", List.of());
        return ResponseEntity.ok(snapshot);
    }

    private ResponseEntity<Map<String, Object>> simulated(Map<String, Object> result) throws JsonProcessingException {
        Map<String, Object> body = new SimulationResult(null, SourceClass.SIMULATED,
                "Scenario output. Not a live sensor reading.", result).toBody();
        body.put("resultJson", objectMapper.writeValueAsString(result));
        return ResponseEntity.ok(body);
    }

    private static int intVal(Object value, int def) {
        if (value == null) return def;
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ignored) {
            return def;
        }
    }

    private static boolean boolVal(Object value, boolean def) {
        if (value == null) return def;
        String s = String.valueOf(value);
        return "true".equalsIgnoreCase(s) || "1".equals(s);
    }
}
