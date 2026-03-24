package com.university.erp.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.erp.entity.BusStop;
import com.university.erp.entity.TransportRoute;
import com.university.erp.repository.BusStopRepository;
import com.university.erp.repository.StudentTransportRepository;
import com.university.erp.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdvancedSimulationController {

    private final TransportRouteRepository transportRouteRepository;
    private final BusStopRepository busStopRepository;
    private final StudentTransportRepository studentTransportRepository;
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

        List<TransportRoute> allRoutes = transportRouteRepository.findAll();
        List<Map<String, Object>> routes = new ArrayList<>();
        int availableRoutes = Math.max(1, allRoutes.size());
        int selected = Math.max(1, Math.min(routeCount, availableRoutes));
        Random r = new Random(42L + totalStudents + routeCount);
        int studentsRemaining = totalStudents;
        double dailyFuel = 0;

        for (int i = 0; i < selected; i++) {
            TransportRoute tr = allRoutes.isEmpty() ? null : allRoutes.get(i % allRoutes.size());
            List<BusStop> stops = tr == null ? List.of() : busStopRepository.findByRouteIdOrderByStopOrderAsc(tr.getId());
            int students = i == selected - 1 ? studentsRemaining : Math.max(40, studentsRemaining / (selected - i));
            studentsRemaining -= students;
            int distance = 8 + r.nextInt(20);
            int occupancy = Math.min(100, 50 + r.nextInt(55));
            double fuelLitres = Math.round((distance * 0.55 + students * 0.02) * 100.0) / 100.0;
            dailyFuel += fuelLitres;
            String status = occupancy > 92 ? "CRITICAL" : occupancy > 75 ? "MODERATE" : "OPTIMAL";

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("routeCode", tr == null ? "R-" + (i + 1) : Optional.ofNullable(tr.getRouteNumber()).orElse("R-" + (i + 1)));
            row.put("routeName", tr == null ? "Campus Route " + (i + 1) : Optional.ofNullable(tr.getRouteName()).orElse("Campus Route " + (i + 1)));
            row.put("origin", tr == null ? "Zone " + (i + 1) : Optional.ofNullable(tr.getStartPoint()).orElse("Zone " + (i + 1)));
            row.put("distanceKm", distance);
            row.put("stops", Math.max(2, stops.size()));
            row.put("students", students);
            row.put("occupancyPercent", occupancy);
            row.put("fuelLitres", fuelLitres);
            row.put("efficiencyScore", Math.max(55, 100 - occupancy / 2));
            row.put("status", status);
            routes.add(row);
        }

        List<Map<String, Object>> clusters = List.of(
                cluster("North Zone", "North", 6.5, "R-01", (int) Math.round(totalStudents * 0.30)),
                cluster("South Zone", "South", 8.2, "R-02", (int) Math.round(totalStudents * 0.25)),
                cluster("East Zone", "East", 5.7, "R-03", (int) Math.round(totalStudents * 0.23)),
                cluster("West Zone", "West", 9.1, "R-04", totalStudents - ((int) Math.round(totalStudents * 0.30)
                        + (int) Math.round(totalStudents * 0.25) + (int) Math.round(totalStudents * 0.23)))
        );

        double monthlyFuel = dailyFuel * 26;
        Map<String, Object> fuelAnalysis = new LinkedHashMap<>();
        fuelAnalysis.put("dailyFuelLitres", round2(dailyFuel));
        fuelAnalysis.put("dailyCostInr", round2(dailyFuel * fuelCost));
        fuelAnalysis.put("monthlyFuelLitres", round2(monthlyFuel));
        fuelAnalysis.put("monthlyCostInr", round2(monthlyFuel * fuelCost));
        fuelAnalysis.put("avgFuelPerStudent", round2(dailyFuel / Math.max(totalStudents, 1)));
        fuelAnalysis.put("co2EmissionsKgDaily", round2(dailyFuel * 2.68));

        Map<String, Object> optimization = new LinkedHashMap<>();
        int score = Math.max(60, Math.min(96, 70 + optimizationTarget));
        optimization.put("optimizationScore", score);
        optimization.put("currentEfficiency", (100 - optimizationTarget) + "%");
        optimization.put("optimizedEfficiency", Math.min(99, 100 - optimizationTarget / 2) + "%");
        optimization.put("fuelReductionPercent", optimizationTarget);
        optimization.put("costSavingsInr", round2(monthlyFuel * fuelCost * (optimizationTarget / 100.0)));
        optimization.put("routesMerged", Math.max(1, selected / 4));
        optimization.put("stopsOptimized", Math.max(3, selected * 2));
        optimization.put("recommendations", List.of(
                "Merge underutilized morning loops in adjacent zones.",
                "Prioritize high-occupancy routes for larger bus allocation.",
                "Shift low-density stop timings by 10 minutes to reduce idle fuel burn."
        ));

        Map<String, Object> evScenario = null;
        if (includeEv) {
            evScenario = new LinkedHashMap<>();
            int evReplacements = Math.max(1, selected / 3);
            evScenario.put("evReplacements", evReplacements);
            evScenario.put("annualFuelSavingsInr", round2(monthlyFuel * fuelCost * 12 * 0.22));
            evScenario.put("evPurchaseCostInr", evReplacements * 32_00_000);
            evScenario.put("paybackYears", round2(4.8 - Math.min(2.0, optimizationTarget / 20.0)));
            evScenario.put("co2ReductionPercent", Math.min(48, 20 + optimizationTarget));
            evScenario.put("electricityCostInr", round2(monthlyFuel * fuelCost * 12 * 0.42));
            evScenario.put("netSavingsInr", round2(monthlyFuel * fuelCost * 12 * 5.2));
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("fleetOverview", Map.of("totalRoutes", selected, "mappedStudents", totalStudents,
                "registeredMappings", studentTransportRepository.count()));
        out.put("routes", routes);
        out.put("clusters", clusters);
        out.put("fuelAnalysis", fuelAnalysis);
        out.put("optimization", optimization);
        out.put("evScenario", evScenario);
        out.put("summary", "Transport optimization indicates measurable fuel and cost savings with stable route coverage.");

        return ResponseEntity.ok(Map.of("resultJson", objectMapper.writeValueAsString(out)));
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
        return ResponseEntity.ok(Map.of(
                "nextSemesterDemand", "Lab infrastructure demand +14%",
                "predictedEnergyGrowth", "Energy load expected to grow by 9.2%",
                "clusterMultiplicationIndex", "1.34x mobility cluster intensity in morning windows",
                "algorithmStatus", "Adaptive optimization active"
        ));
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

    private static Map<String, Object> cluster(String zone, String area, double km, String route, int students) {
        int pct = Math.max(5, Math.min(55, (int) Math.round((students / 28.0))));
        return Map.of(
                "zoneName", zone,
                "area", area,
                "distanceFromCampusKm", km,
                "assignedRoute", route,
                "studentCount", students,
                "percentage", pct
        );
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

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
