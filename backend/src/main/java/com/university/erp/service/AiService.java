package com.university.erp.service;

import com.university.erp.model.BusStop;
import com.university.erp.model.TransportRoute;
import com.university.erp.repository.BusStopRepository;
import com.university.erp.repository.StudentTransportRepository;
import com.university.erp.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AiService {

    private final TransportRouteRepository transportRouteRepository;
    private final BusStopRepository busStopRepository;
    private final StudentTransportRepository studentTransportRepository;

    public Map<String, Object> simulateTransport(int routeCount, int totalStudents, int fuelCost, int optimizationTarget, boolean includeEv) {
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
            int distance = 10 + r.nextInt(20);
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

        List<Map<String, Object>> multipliedClusters = new ArrayList<>();
        for (Map<String, Object> c : clusters) {
            Map<String, Object> mc = new LinkedHashMap<>(c);
            int current = (int) c.get("studentCount");
            mc.put("projectedCount", (int)(current * 1.45));
            multipliedClusters.add(mc);
        }

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
        out.put("multipliedClusters", multipliedClusters);
        out.put("fuelAnalysis", fuelAnalysis);
        out.put("optimization", optimization);
        out.put("evScenario", evScenario);
        out.put("summary", "Transport optimization indicates measurable fuel and cost savings with stable route coverage.");
        return out;
    }

    public Map<String, Object> predictAnalytics() {
        Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("available", false);
        out.put("nextSemesterDemand", null);
        out.put("predictedEnergyGrowth", null);
        out.put("clusterMultiplicationIndex", null);
        out.put("algorithmStatus", "No prediction available");
        return out;
    }

    public String predictAcademicRisk(Long studentId) {
        return null;
    }

    public List<String> recommendCareer(Long studentId) {
        return List.of();
    }

    private static Map<String, Object> cluster(String zone, String area, double km, String route, int students) {
        int pct = Math.max(5, Math.min(55, (int) Math.round((students / 28.0))));
        return Map.of("zoneName", zone, "area", area, "distanceFromCampusKm", km, "assignedRoute", route, "studentCount", students, "percentage", pct);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
