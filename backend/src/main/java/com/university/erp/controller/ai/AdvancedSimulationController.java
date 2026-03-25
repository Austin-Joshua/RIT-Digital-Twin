package com.university.erp.controller.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
        return ResponseEntity.ok(Map.of("resultJson", objectMapper.writeValueAsString(result)));
    }

    @PostMapping("/energy/optimize/{buildingId}")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> optimizeEnergy(@PathVariable Long buildingId) throws JsonProcessingException {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("buildingId", buildingId);
        result.put("currentUsageAvg", 500);
        result.put("projectedUsage", 420);
        result.put("savings", 80);
        result.put("roiMonths", 21);
        result.put("solarPotential", 135);
        result.put("recommendations", List.of(
                "Shift HVAC pre-cooling window by 20 minutes based on occupancy curve.",
                "Enable adaptive lighting for low-occupancy blocks after 5 PM.",
                "Increase rooftop solar dispatch during midday peak."
        ));
        return ResponseEntity.ok(Map.of("resultJson", objectMapper.writeValueAsString(result)));
    }

    @PostMapping("/crowd/simulate")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> simulateCrowd(@RequestBody Map<String, Object> payload)
            throws JsonProcessingException {
        int occupancy = intVal(payload.get("occupancy"), 500);
        int evac = Math.max(4, occupancy / 45);
        String congestion = occupancy > 900 ? "CRITICAL" : occupancy > 600 ? "HIGH" : occupancy > 300 ? "MODERATE" : "LOW";
        int readiness = Math.max(58, 96 - evac);
        Map<String, Object> out = Map.of(
                "congestionLevel", congestion,
                "estimatedEvacuationTimeMin", evac,
                "readinessScore", readiness
        );
        return ResponseEntity.ok(Map.of("resultJson", objectMapper.writeValueAsString(out)));
    }

    @PostMapping("/classrooms/simulate")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> simulateClassroom(@RequestBody Map<String, Object> payload)
            throws JsonProcessingException {
        int strength = intVal(payload.get("studentStrength"), 60);
        boolean needsProjector = boolVal(payload.get("needsProjector"), false);
        List<Map<String, Object>> rooms = new ArrayList<>();
        rooms.add(room("A-101", Math.max(60, strength), true, "Main Block"));
        rooms.add(room("B-204", Math.max(70, strength + 5), true, "Science Block"));
        if (!needsProjector) {
            rooms.add(room("C-305", Math.max(50, strength - 10), false, "Engineering Block"));
        }
        return ResponseEntity.ok(Map.of("resultJson", objectMapper.writeValueAsString(rooms)));
    }

    @GetMapping("/analytics/predictions")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> analyticsPredictions() {
        return ResponseEntity.ok(aiService.predictAnalytics());
    }

    @GetMapping("/analytics/sustainability")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> sustainabilitySnapshot() {
        return ResponseEntity.ok(Map.of(
                "kpis", List.of(
                        Map.of("title", "Carbon Footprint", "value", "42.5 tCO2e", "trend", "-12% vs Last Yr"),
                        Map.of("title", "Renewable Power", "value", "35%", "trend", "+5% Solar Added"),
                        Map.of("title", "Water Recycled", "value", "1.2M Ltrs", "trend", "STP Operating @ 90%"),
                        Map.of("title", "Waste Diverted", "value", "88%", "trend", "To compost & recycle")
                ),
                "carbonData", List.of(
                        Map.of("month", "Jan", "emitted", 400, "offset", 240),
                        Map.of("month", "Feb", "emitted", 300, "offset", 139),
                        Map.of("month", "Mar", "emitted", 200, "offset", 380),
                        Map.of("month", "Apr", "emitted", 278, "offset", 390),
                        Map.of("month", "May", "emitted", 189, "offset", 480),
                        Map.of("month", "Jun", "emitted", 239, "offset", 380),
                        Map.of("month", "Jul", "emitted", 349, "offset", 430)
                )
        ));
    }

    private static Map<String, Object> room(String room, int cap, boolean projector, String building) {
        return Map.of(
                "roomNumber", room,
                "capacity", cap,
                "hasProjector", projector,
                "building", Map.of("buildingName", building)
        );
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
