package com.university.erp.service;

import com.university.erp.intelligence.SourceClass;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for Evidence-Based Interactive Campus Missions.
 * Provides educational challenge scenarios with transparent scoring rules,
 * constraint verification, and objective feedback grounded in simulated results.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CampusMissionService {

    private final ScenarioSimulationService scenarioSimulationService;

    public record MissionDef(String id, String title, String category, String description,
                             String target, String constraint, List<String> recommendedLevers) {
    }

    private static final List<MissionDef> MISSIONS = List.of(
            new MissionDef(
                    "energy-reduction",
                    "Modeled Energy Conservation Challenge",
                    "Sustainability",
                    "Reduce total campus electrical demand by at least 15% through schedule consolidation and HVAC efficiency improvements without causing seat shortfalls.",
                    "Energy demand reduction >= 15% (kW)",
                    "Resource shortfall must equal 0 (no unhoused students).",
                    List.of("hvacEfficiencyPercent (target: 20-35%)", "timetableLoadPercent (target: -10% to -15%)")
            ),
            new MissionDef(
                    "utilization-boost",
                    "Classroom Utilization Optimization",
                    "Space Planning",
                    "Increase weekly classroom allocation rate to at least 60% without letting average crowd density exceed 85% or creating rooms over capacity.",
                    "Classroom utilization >= 60%",
                    "Crowd density <= 85% and overflow rooms == 0.",
                    List.of("timetableLoadPercent (target: +15-25%)", "extraClassrooms (target: 0 to 4)")
            ),
            new MissionDef(
                    "bottleneck-elimination",
                    "Peak Crowd Bottleneck Elimination",
                    "Safety & Facilities",
                    "Eliminate all rooms over capacity during peak periods while maintaining student intake (intake reduction not exceeding 10%).",
                    "Rooms over capacity == 0",
                    "Intake change >= -10% (cannot solve solely by slashing student enrollment).",
                    List.of("extraClassrooms (target: +4 to +8)", "seatsPerNewClassroom (target: 60-80)", "timetableLoadPercent (target: -5% to -10%)")
            ),
            new MissionDef(
                    "fleet-electrification",
                    "Green Transit Electrification Challenge",
                    "Logistics & ESG",
                    "Convert at least 40% of the campus transit fleet to electric vehicles, abating diesel emissions while maintaining at least 400 total route seats.",
                    "EV Fleet Adoption >= 40% and Carbon Emissions abatement >= 10%",
                    "Total bus route seat capacity >= 400 seats.",
                    List.of("evAdoptionPercent (target: 40-80%)", "busCapacityPercent (target: +10% to +30%)")
            )
    );

    public List<MissionDef> getMissions() {
        return MISSIONS;
    }

    public Optional<MissionDef> getMission(String id) {
        return MISSIONS.stream().filter(m -> m.id().equalsIgnoreCase(id)).findFirst();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> evaluateMission(String missionId, Map<String, Object> candidateAdjustments) {
        MissionDef def = getMission(missionId).orElse(MISSIONS.get(0));

        Map<String, Object> previewReq = new LinkedHashMap<>();
        Map<String, Object> scenario = new LinkedHashMap<>(candidateAdjustments != null ? candidateAdjustments : Map.of());
        scenario.put("name", "Mission Evaluation: " + def.title());
        previewReq.put("scenarios", List.of(scenario));

        Map<String, Object> simulationResult = scenarioSimulationService.preview(previewReq);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> scenarioList = (List<Map<String, Object>>) simulationResult.get("scenarios");
        Map<String, Object> currentMetrics = (Map<String, Object>) simulationResult.get("current");

        if (scenarioList == null || scenarioList.isEmpty()) {
            return Map.of("error", "Simulation preview could not be computed.");
        }

        Map<String, Object> evaluated = scenarioList.get(0);
        @SuppressWarnings("unchecked")
        Map<String, Object> simulatedMetrics = (Map<String, Object>) evaluated.get("simulated");
        @SuppressWarnings("unchecked")
        Map<String, Object> deltas = (Map<String, Object>) evaluated.get("deltas");

        // Extract key metrics
        double currentEnergy = extractValue(currentMetrics, "energy", 300.0);
        double simEnergy = extractValue(simulatedMetrics, "energy", 300.0);
        double energyDelta = extractDelta(deltas, "energy");
        double energyDeltaPct = currentEnergy > 0 ? (energyDelta / currentEnergy * 100.0) : 0;

        double simUtil = extractValue(simulatedMetrics, "utilization", 45.0);
        double simCrowd = extractValue(simulatedMetrics, "crowd", 60.0);
        double simOverflow = extractValue(simulatedMetrics, "overflowRooms", 0.0);
        double simShortfall = extractValue(simulatedMetrics, "resourceDemand", 0.0);
        double simSeats = extractValue(simulatedMetrics, "transportSeats", 400.0);
        double simCarbon = extractValue(simulatedMetrics, "carbonEmissions", 2000.0);
        double currentCarbon = extractValue(currentMetrics, "carbonEmissions", 2000.0);
        double carbonDeltaPct = currentCarbon > 0 ? ((simCarbon - currentCarbon) / currentCarbon * 100.0) : 0;

        int score = 0;
        List<String> breakdown = new ArrayList<>();
        boolean targetPassed = false;
        boolean constraintsPassed = true;

        switch (def.id()) {
            case "energy-reduction" -> {
                // Goal: energy reduction >= 15% (energyDeltaPct <= -15%)
                if (energyDeltaPct <= -15.0) {
                    targetPassed = true;
                    int pts = (int) Math.min(60, 45 + Math.abs(energyDeltaPct));
                    score += pts;
                    breakdown.add(String.format("Target achieved: %.1f%% energy cut (+%d pts)", Math.abs(energyDeltaPct), pts));
                } else {
                    int partial = (int) Math.max(0, (Math.abs(energyDeltaPct) / 15.0) * 40);
                    score += partial;
                    breakdown.add(String.format("Partial progress: %.1f%% energy cut vs 15%% target (+%d pts)", Math.abs(energyDeltaPct), partial));
                }
                // Constraint: seat shortfall == 0
                if (simShortfall == 0) {
                    score += 30;
                    breakdown.add("Constraint met: Zero student seat shortfall (+30 pts)");
                } else {
                    constraintsPassed = false;
                    score -= 20;
                    breakdown.add(String.format("Constraint violated: %d seats short (-20 pts penalty)", (long) simShortfall));
                }
                // Bonus: if utilization didn't drop below 40%
                if (simUtil >= 40.0) {
                    score += 10;
                    breakdown.add("Efficiency bonus: Classroom utilization maintained >= 40% (+10 pts)");
                }
            }
            case "utilization-boost" -> {
                // Goal: utilization >= 60%
                if (simUtil >= 60.0) {
                    targetPassed = true;
                    int pts = (int) Math.min(60, 40 + (simUtil - 60.0) * 2);
                    score += pts;
                    breakdown.add(String.format("Target achieved: %.1f%% classroom utilization (+%d pts)", simUtil, pts));
                } else {
                    int partial = (int) Math.max(0, (simUtil / 60.0) * 35);
                    score += partial;
                    breakdown.add(String.format("Partial progress: %.1f%% utilization vs 60%% target (+%d pts)", simUtil, partial));
                }
                // Constraint: crowd <= 85% and overflow == 0
                if (simCrowd <= 85.0 && simOverflow == 0) {
                    score += 30;
                    breakdown.add("Constraint met: Crowd density <= 85% and zero overflow rooms (+30 pts)");
                } else {
                    constraintsPassed = false;
                    int pen = (simCrowd > 85.0 ? 15 : 0) + (simOverflow > 0 ? 15 : 0);
                    score -= pen;
                    breakdown.add(String.format("Constraint violated: crowd %.1f%%, %d overflow rooms (-%d pts penalty)", simCrowd, (long) simOverflow, pen));
                }
                if (energyDeltaPct <= 5.0) {
                    score += 10;
                    breakdown.add("Bonus: Modest energy growth <= 5% (+10 pts)");
                }
            }
            case "bottleneck-elimination" -> {
                // Goal: overflow rooms == 0
                if (simOverflow == 0) {
                    targetPassed = true;
                    score += 60;
                    breakdown.add("Target achieved: Zero rooms over capacity (+60 pts)");
                } else {
                    int partial = (int) Math.max(0, 50 - (simOverflow * 15));
                    score += partial;
                    breakdown.add(String.format("Target incomplete: %d rooms still over capacity (+%d pts)", (long) simOverflow, partial));
                }
                // Constraint: intake reduction not > 10%
                int intakeVal = candidateAdjustments != null && candidateAdjustments.get("intakePercent") instanceof Number num
                        ? num.intValue() : 0;
                if (intakeVal >= -10) {
                    score += 30;
                    breakdown.add(String.format("Constraint met: Intake change %d%% >= -10%% (+30 pts)", intakeVal));
                } else {
                    constraintsPassed = false;
                    score -= 25;
                    breakdown.add(String.format("Constraint violated: Intake slashed by %d%% (-25 pts penalty)", Math.abs(intakeVal)));
                }
                if (simCrowd <= 80.0) {
                    score += 10;
                    breakdown.add("Bonus: Average crowd comfortably below 80% (+10 pts)");
                }
            }
            case "fleet-electrification" -> {
                int evAdoption = candidateAdjustments != null && candidateAdjustments.get("evAdoptionPercent") instanceof Number num
                        ? num.intValue() : 0;
                if (evAdoption >= 40 && carbonDeltaPct <= -10.0) {
                    targetPassed = true;
                    score += 60;
                    breakdown.add(String.format("Target achieved: %d%% EV adoption with %.1f%% carbon abatement (+60 pts)", evAdoption, Math.abs(carbonDeltaPct)));
                } else {
                    int partial = (int) (Math.min(1.0, evAdoption / 40.0) * 35);
                    score += partial;
                    breakdown.add(String.format("Partial progress: %d%% EV adoption vs 40%% target (+%d pts)", evAdoption, partial));
                }
                if (simSeats >= 400) {
                    score += 30;
                    breakdown.add(String.format("Constraint met: %d route seats >= 400 (+30 pts)", (long) simSeats));
                } else {
                    constraintsPassed = false;
                    score -= 20;
                    breakdown.add(String.format("Constraint violated: Only %d route seats available (-20 pts penalty)", (long) simSeats));
                }
                if (evAdoption >= 60) {
                    score += 10;
                    breakdown.add("Bonus: High EV transition rate >= 60% (+10 pts)");
                }
            }
        }

        score = Math.max(0, Math.min(100, score));
        boolean passed = score >= 70 && targetPassed && constraintsPassed;
        String badge = score >= 90 ? "GOLD" : score >= 75 ? "SILVER" : score >= 70 ? "BRONZE" : "RETRY";

        String explanation = String.format("Mission '%s' scored %d/100 (%s). %s",
                def.title(), score, passed ? "PASSED" : "NOT YET SATISFIED",
                passed ? "All critical objectives and operational constraints were verified by the simulation engine."
                        : "Review the violated constraints or insufficient lever parameters in the breakdown.");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("missionId", def.id());
        result.put("title", def.title());
        result.put("score", score);
        result.put("passed", passed);
        result.put("badge", badge);
        result.put("targetPassed", targetPassed);
        result.put("constraintsPassed", constraintsPassed);
        result.put("breakdown", breakdown);
        result.put("explanation", explanation);
        result.put("source", SourceClass.SIMULATED.name());
        result.put("provenance", "SIMULATED");
        result.put("simulatedMetrics", Map.of(
                "energyKw", simEnergy,
                "utilizationPct", simUtil,
                "crowdPct", simCrowd,
                "overflowRooms", simOverflow,
                "carbonCo2Day", simCarbon,
                "energyDeltaPct", Math.round(energyDeltaPct * 10.0) / 10.0
        ));
        return result;
    }

    private static double extractValue(Map<String, Object> map, String key, double fallback) {
        if (map == null) return fallback;
        Object obj = map.get(key);
        if (obj instanceof Map<?, ?> m && m.get("value") instanceof Number num) {
            return num.doubleValue();
        }
        return fallback;
    }

    private static double extractDelta(Map<String, Object> deltas, String key) {
        if (deltas == null) return 0;
        Object obj = deltas.get(key);
        return obj instanceof Number num ? num.doubleValue() : 0;
    }
}
