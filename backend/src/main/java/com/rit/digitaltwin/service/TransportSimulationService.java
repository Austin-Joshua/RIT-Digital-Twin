package com.rit.digitaltwin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rit.digitaltwin.dto.TransportSimulationRequest;
import com.rit.digitaltwin.dto.TransportSimulationResponse;
import com.rit.digitaltwin.dto.TransportSimulationResponse.*;
import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import com.rit.digitaltwin.simulation.TransportEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransportSimulationService {

        private final SimulationResultRepository simulationResultRepository;
        private final ObjectMapper objectMapper;
        private final TransportEngine transportEngine;

        // RIT Chennai typical bus routes
        private static final List<RouteTemplate> ROUTE_TEMPLATES = List.of(
                        new RouteTemplate("R01", "Chennai Central Route", "Chennai Central", 25.0, 65, 8, 320, 50,
                                        "BUS"),
                        new RouteTemplate("R02", "Tambaram Route", "Tambaram", 18.0, 45, 6, 280, 50, "BUS"),
                        new RouteTemplate("R03", "Guindy Route", "Guindy", 22.0, 55, 7, 250, 50, "BUS"),
                        new RouteTemplate("R04", "T. Nagar Route", "T. Nagar", 28.0, 70, 9, 200, 50, "BUS"),
                        new RouteTemplate("R05", "Porur Route", "Porur", 12.0, 30, 4, 180, 40, "MINI_BUS"),
                        new RouteTemplate("R06", "Velachery Route", "Velachery", 20.0, 50, 6, 240, 50, "BUS"),
                        new RouteTemplate("R07", "Chromepet Route", "Chromepet", 15.0, 35, 5, 220, 50, "BUS"),
                        new RouteTemplate("R08", "Avadi Route", "Avadi", 30.0, 80, 10, 160, 50, "BUS"),
                        new RouteTemplate("R09", "Ambattur Route", "Ambattur", 24.0, 60, 7, 190, 50, "BUS"),
                        new RouteTemplate("R10", "Poonamallee Shuttle", "Poonamallee", 8.0, 20, 3, 150, 30, "SHUTTLE"),
                        new RouteTemplate("R11", "Kancheepuram Route", "Kancheepuram", 35.0, 90, 6, 100, 50, "BUS"),
                        new RouteTemplate("R12", "Sriperumbudur EV Route", "Sriperumbudur", 10.0, 25, 4, 210, 50,
                                        "ELECTRIC_BUS"));

        // Student residential zone clusters around RIT Chennai
        private static final List<ClusterTemplate> CLUSTER_TEMPLATES = List.of(
                        new ClusterTemplate("South Chennai", "Tambaram / Chromepet / Pallavaram", 15.0, 500),
                        new ClusterTemplate("Central Chennai", "T. Nagar / Guindy / Saidapet", 22.0, 420),
                        new ClusterTemplate("West Chennai", "Porur / Poonamallee / Avadi", 12.0, 480),
                        new ClusterTemplate("North Chennai", "Central / Ambattur / Anna Nagar", 26.0, 350),
                        new ClusterTemplate("Far South", "Kancheepuram / Chengalpattu", 35.0, 200),
                        new ClusterTemplate("Campus Nearby", "Sriperumbudur / Thandalam", 6.0, 550),
                        new ClusterTemplate("Hostel Residents", "On Campus", 0.5, 300));

        private record ClusterTemplate(String zone, String area, double distKm, int students) {
        }

        @Transactional
        public TransportSimulationResponse runSimulation(TransportSimulationRequest request) {
                long startTime = System.currentTimeMillis();
                int routeCount = Math.min(request.getRouteCount(), ROUTE_TEMPLATES.size());
                double fuelCost = request.getFuelCostPerLitre();
                double optimPct = request.getOptimizationTarget() / 100.0;

                log.info("Starting transport simulation: {} routes, {} students", routeCount,
                                request.getTotalStudents());

                // --- 1. Build route details ---
                List<RouteTemplate> selectedRoutes = ROUTE_TEMPLATES.subList(0, routeCount);
                double totalDistance = 0, totalFuel = 0;
                int totalStudents = 0, totalStops = 0;

                List<RouteDetail> routes = new ArrayList<>();
                for (RouteTemplate rt : selectedRoutes) {
                        RouteDetail detail = transportEngine.buildRouteDetail(rt.code(), rt.name(), rt.origin(),
                                        rt.distKm(),
                                        rt.durationMin(), rt.stops(), rt.students(), rt.capacity(), rt.vehicleType());
                        routes.add(detail);

                        totalDistance += rt.distKm() * 2;
                        // Calculate fuel again locally or trust detail?
                        // Detail gives rounded fuel. I'll use detail.
                        totalFuel += detail.getFuelLitres();
                        totalStudents += rt.students();
                        totalStops += rt.stops();
                }

                double avgOccupancy = routes.stream().mapToDouble(RouteDetail::getOccupancyPercent).average().orElse(0);

                // --- 2. Fleet overview ---
                FleetOverview fleet = FleetOverview.builder()
                                .totalRoutes(routeCount)
                                .totalVehicles(routeCount + 2) // spare vehicles
                                .totalStudents(totalStudents)
                                .totalDistanceKm(round(totalDistance / 2)) // one-way
                                .averageOccupancyPercent(round(avgOccupancy))
                                .totalDailyTripsKm(round(totalDistance))
                                .build();

                // --- 3. Fuel analysis ---
                double co2PerLitre = 2.68; // kg CO2 per litre diesel
                FuelAnalysis fuelAnalysis = FuelAnalysis.builder()
                                .dailyFuelLitres(round(totalFuel))
                                .monthlyFuelLitres(round(totalFuel * 26)) // 26 working days
                                .dailyCostInr(round(totalFuel * fuelCost))
                                .monthlyCostInr(round(totalFuel * 26 * fuelCost))
                                .avgFuelPerStudent(round(totalFuel / totalStudents))
                                .co2EmissionsKgDaily(round(totalFuel * co2PerLitre))
                                .co2EmissionsKgMonthly(round(totalFuel * 26 * co2PerLitre))
                                .build();

                // --- 4. Optimization ---
                double currentEfficiency = routes.stream().mapToDouble(RouteDetail::getEfficiencyScore).average()
                                .orElse(0);

                OptimizationResult optimization = transportEngine.optimize(currentEfficiency, optimPct, totalFuel,
                                routeCount, totalStops, fuelCost, co2PerLitre,
                                Boolean.TRUE.equals(request.getIncludeEvScenario()));

                // --- 5. Student clusters ---
                int clusterTotal = CLUSTER_TEMPLATES.stream().mapToInt(ClusterTemplate::students).sum();
                List<StudentCluster> clusters = CLUSTER_TEMPLATES.stream().map(ct -> {
                        double pct = (double) ct.students() / clusterTotal * 100;
                        String assignedRoute = selectedRoutes.stream()
                                        .filter(r -> ct.area().toLowerCase()
                                                        .contains(r.origin().toLowerCase().split(" ")[0]))
                                        .map(RouteTemplate::code)
                                        .findFirst().orElse("Multiple");
                        return StudentCluster.builder()
                                        .zoneName(ct.zone())
                                        .area(ct.area())
                                        .studentCount(ct.students())
                                        .distanceFromCampusKm(ct.distKm())
                                        .percentage(round(pct))
                                        .assignedRoute(assignedRoute)
                                        .build();
                }).collect(Collectors.toList());

                // --- 6. EV scenario ---
                EvScenario evScenario = null;
                if (Boolean.TRUE.equals(request.getIncludeEvScenario())) {
                        int evCount = 4;
                        evScenario = transportEngine.calculateEvScenario(evCount, routeCount, totalFuel, totalDistance,
                                        fuelCost);
                }

                long execTime = System.currentTimeMillis() - startTime;

                double fuelSaved = totalFuel * optimPct;

                String summary = String.format(
                                "Simulated %d routes for %d students across %.0f km daily. " +
                                                "Current fuel: %.0f L/day (₹%.0f). With %s%% optimization: save %.0f L/month (₹%.0f). "
                                                +
                                                "Avg occupancy: %.0f%%.",
                                routeCount, totalStudents, totalDistance,
                                totalFuel, totalFuel * fuelCost,
                                request.getOptimizationTarget(), fuelSaved * 26, fuelSaved * 26 * fuelCost,
                                avgOccupancy);

                // Save result
                SimulationResult simResult = saveResult(request, summary, execTime);

                return TransportSimulationResponse.builder()
                                .simulationId(simResult.getId())
                                .status("COMPLETED")
                                .executionTimeMs(execTime)
                                .summary(summary)
                                .fleetOverview(fleet)
                                .fuelAnalysis(fuelAnalysis)
                                .optimization(optimization)
                                .routes(routes)
                                .clusters(clusters)
                                .evScenario(evScenario)
                                .build();
        }

        private SimulationResult saveResult(TransportSimulationRequest req, String summary, long execTime) {
                try {
                        SimulationResult result = SimulationResult.builder()
                                        .simulationType(SimulationType.TRANSPORT_OPTIMIZATION)
                                        .simulationName("Transport Sim - " + req.getRouteCount() + " routes")
                                        .parameters(objectMapper.writeValueAsString(req))
                                        .results("{}")
                                        .summary(summary)
                                        .executionTimeMs(execTime)
                                        .status(SimulationStatus.COMPLETED)
                                        .startedAt(LocalDateTime.now().minus(execTime, ChronoUnit.MILLIS))
                                        .completedAt(LocalDateTime.now())
                                        .build();
                        return simulationResultRepository.save(result);
                } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to serialize transport simulation", e);
                }
        }

        private double round(double v) {
                return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
        }
}
