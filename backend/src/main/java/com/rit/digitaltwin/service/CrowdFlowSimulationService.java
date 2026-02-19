package com.rit.digitaltwin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rit.digitaltwin.dto.CrowdFlowSimulationRequest;
import com.rit.digitaltwin.dto.CrowdFlowSimulationResponse;
import com.rit.digitaltwin.dto.CrowdFlowSimulationResponse.*;
import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import com.rit.digitaltwin.simulation.CrowdEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrowdFlowSimulationService {

    private final SimulationResultRepository simulationResultRepository;
    private final ObjectMapper objectMapper;
    private final CrowdEngine crowdEngine;

    // Campus zones with area and capacity data
    private static final List<ZoneTemplate> CAMPUS_ZONES = List.of(
            new ZoneTemplate("Z01", "Main Entrance Lobby", "Main Block", 0, 400, 300, 3),
            new ZoneTemplate("Z02", "Lecture Hall Complex", "Academic Block 1", 1, 600, 800, 4),
            new ZoneTemplate("Z03", "Lab Wing A", "Academic Block 1", 2, 300, 500, 2),
            new ZoneTemplate("Z04", "Lab Wing B", "Academic Block 2", 2, 300, 500, 2),
            new ZoneTemplate("Z05", "Library Reading Hall", "Library Block", 1, 350, 600, 2),
            new ZoneTemplate("Z06", "Central Corridor", "Main Block", 0, 200, 150, 2),
            new ZoneTemplate("Z07", "Cafeteria & Food Court", "Canteen Block", 0, 500, 450, 3),
            new ZoneTemplate("Z08", "Seminar Hall 1", "Academic Block 2", 1, 250, 350, 2),
            new ZoneTemplate("Z09", "Computer Lab Complex", "Science Block", 2, 200, 400, 2),
            new ZoneTemplate("Z10", "Admin & Office Wing", "Administrative Block", 1, 150, 300, 2),
            new ZoneTemplate("Z11", "Workshop Floor", "Workshop Block", 0, 300, 700, 3),
            new ZoneTemplate("Z12", "Sports Indoor Arena", "Sports Complex", 0, 400, 900, 4),
            new ZoneTemplate("Z13", "Auditorium", "Main Block", 0, 800, 1000, 6),
            new ZoneTemplate("Z14", "Parking & Bus Bay", "Open Area", 0, 300, 2000, 4),
            new ZoneTemplate("Z15", "Hostel Common Area", "Hostel Block A", 0, 250, 350, 2));

    @Transactional
    public CrowdFlowSimulationResponse runSimulation(CrowdFlowSimulationRequest request) {
        long startTime = System.currentTimeMillis();
        int totalOccupancy = request.getTotalOccupancy();
        int totalCapacity = CAMPUS_ZONES.stream().mapToInt(ZoneTemplate::capacity).sum();
        boolean isPeak = "PEAK_HOUR".equals(request.getScenario());
        boolean isEvent = "EVENT".equals(request.getScenario());

        log.info("Starting crowd flow simulation: {} scenario, {} occupancy", request.getScenario(), totalOccupancy);

        // Apply scenario multiplier
        double scenarioMultiplier = isPeak ? 1.2 : isEvent ? 1.5 : 1.0;
        int effectiveOccupancy = (int) Math.min(totalOccupancy * scenarioMultiplier, totalCapacity);

        // --- 1. Zone distribution ---
        List<ZoneData> zones = crowdEngine.distributeOccupancy(effectiveOccupancy, CAMPUS_ZONES);

        int congestionZones = (int) zones.stream()
                .filter(z -> "HIGH".equals(z.getCongestionLevel()) || "CRITICAL".equals(z.getCongestionLevel()))
                .count();
        int safeZones = (int) zones.stream()
                .filter(z -> "LOW".equals(z.getCongestionLevel()) || "NORMAL".equals(z.getCongestionLevel())).count();
        double avgDensity = zones.stream().mapToDouble(ZoneData::getDensityPerSqm).average().orElse(0);

        CampusOverview overview = CampusOverview.builder()
                .totalOccupancy(effectiveOccupancy)
                .totalCapacity(totalCapacity)
                .occupancyPercent(round((double) effectiveOccupancy / totalCapacity * 100))
                .totalZones(zones.size())
                .congestionZones(congestionZones)
                .safeZones(safeZones)
                .avgDensityPerSqm(round(avgDensity))
                .build();

        // --- 2. Congestion detection ---
        List<CongestionPoint> congestionPoints = crowdEngine.detectCongestion(zones);

        // --- 3. Evacuation analysis ---
        EvacuationAnalysis evacuation = null;
        if (Boolean.TRUE.equals(request.getIncludeEvacuation())) {
            evacuation = crowdEngine.calculateEvacuation(effectiveOccupancy, request.getExitGates(),
                    request.getEmergencyType());
        }

        // --- 4. Emergency readiness ---
        // Calculated simply here or extended in engine.
        // Engine signature has: calculateReadiness(double, double, double, double,
        // double, List<String>, List<String>)
        // So we need to compute scores first or move score comp to engine too.
        // For now, I will use the engine method but I need to adapt the logic because I
        // extracted only the final assembly object builder part to engine (check my
        // previous step).
        // Wait, looking at my CrowdEngine extraction:
        /*
         * public EmergencyReadiness calculateReadiness(double evacScore, double
         * signageScore, double exitAccessScore, double drillScore, double
         * fireEquipScore, List<String> improvements, List<String> strengths) {
         * ...
         * }
         */
        // I need to calculate scores here first basically.

        double evacScore = evacuation != null ? (evacuation.getEstimatedEvacuationTimeMin() <= 5 ? 95
                : evacuation.getEstimatedEvacuationTimeMin() <= 10 ? 80
                        : evacuation.getEstimatedEvacuationTimeMin() <= 15 ? 60 : 40)
                : 70;
        double signageScore = 78;
        double exitAccessScore = Math.min(100, request.getExitGates() * 22.0);
        double drillScore = 65;
        double fireEquipScore = 82;

        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (fireEquipScore >= 80)
            strengths.add("Fire equipment well-maintained across campus");
        if (exitAccessScore >= 80)
            strengths.add("Sufficient exit gates for campus capacity");
        if (evacScore >= 80)
            strengths.add("Evacuation time within acceptable limits");

        if (drillScore < 70)
            improvements.add("Increase emergency drill frequency to quarterly");
        if (signageScore < 80)
            improvements.add("Upgrade emergency signage in older buildings");
        if (congestionPoints.size() > 3)
            improvements.add("Address " + congestionPoints.size() + " congestion bottlenecks");
        improvements.add("Install real-time occupancy sensors in all zones");

        EmergencyReadiness readiness = crowdEngine.calculateReadiness(evacScore, signageScore, exitAccessScore,
                drillScore, fireEquipScore, improvements, strengths);

        // --- 5. Hourly flow ---
        List<HourlyFlow> hourlyFlow = crowdEngine.generateHourlyFlow(totalOccupancy);

        long execTime = System.currentTimeMillis() - startTime;

        String summary = String.format(
                "%s simulation: %d people across %d zones (%.0f%% capacity). " +
                        "%d congestion zones detected. %s",
                request.getScenario(), effectiveOccupancy, zones.size(),
                (double) effectiveOccupancy / totalCapacity * 100,
                congestionZones,
                evacuation != null ? String.format("Evacuation time: %.1f min (%s).",
                        evacuation.getEstimatedEvacuationTimeMin(), evacuation.getEvacuationRating()) : "");

        SimulationResult simResult = saveResult(request, summary, execTime);

        return CrowdFlowSimulationResponse.builder()
                .simulationId(simResult.getId())
                .status("COMPLETED")
                .executionTimeMs(execTime)
                .summary(summary)
                .scenario(request.getScenario())
                .campusOverview(overview)
                .evacuation(evacuation)
                .zones(zones)
                .congestionPoints(congestionPoints)
                .readiness(readiness)
                .hourlyFlow(hourlyFlow)
                .build();
    }

    private SimulationResult saveResult(CrowdFlowSimulationRequest req, String summary, long execTime) {
        try {
            SimulationResult r = SimulationResult.builder()
                    .simulationType(SimulationType.CROWD_FLOW)
                    .simulationName("Crowd Flow - " + req.getScenario())
                    .inputParams(objectMapper.writeValueAsString(req))
                    .outputData("{}")
                    .summary(summary)
                    .executionTimeMs(execTime)
                    .status(SimulationStatus.COMPLETED)
                    .startedAt(LocalDateTime.now().minus(execTime, ChronoUnit.MILLIS))
                    .completedAt(LocalDateTime.now())
                    .build();
            return simulationResultRepository.save(r);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize crowd flow simulation", e);
        }
    }

    private double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
