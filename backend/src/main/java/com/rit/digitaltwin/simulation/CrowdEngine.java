package com.rit.digitaltwin.simulation;

import com.rit.digitaltwin.dto.CrowdFlowSimulationResponse.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Engine for Crowd Flow and Evacuation logic.
 */
@Component
public class CrowdEngine {

    // Occupancy pattern multipliers by hour
    private static final double[] HOURLY_OCCUPANCY = {
            0.05, 0.03, 0.02, 0.02, 0.03, 0.05, 0.15, 0.40, 0.75, 0.90, 0.95, 0.85,
            0.70, 0.60, 0.80, 0.88, 0.75, 0.45, 0.30, 0.20, 0.15, 0.10, 0.08, 0.06
    };

    public List<ZoneData> distributeOccupancy(int totalOccupancy, List<com.rit.digitaltwin.model.ZoneTemplate> zones) {
        double[] weights = { 0.08, 0.14, 0.07, 0.06, 0.08, 0.05, 0.12, 0.06, 0.05, 0.03, 0.07, 0.06, 0.06, 0.04, 0.03 };
        Random rng = new Random(42);
        List<ZoneData> result = new ArrayList<>();

        for (int i = 0; i < zones.size(); i++) {
            com.rit.digitaltwin.model.ZoneTemplate zt = zones.get(i);
            double jitter = 1.0 + (rng.nextDouble() - 0.5) * 0.3;
            int occupancy = (int) Math.min(zt.capacity(), totalOccupancy * weights[i] * jitter);
            double occPct = (double) occupancy / zt.capacity() * 100;
            double density = occupancy / zt.areaSqm();

            String congestionLevel = getCongestionLevel(occPct);
            double heatmap = getHeatmapIntensity(occPct);

            result.add(ZoneData.builder()
                    .zoneId(zt.id())
                    .zoneName(zt.name())
                    .buildingName(zt.building())
                    .floor(zt.floor())
                    .currentOccupancy(occupancy)
                    .maxCapacity(zt.capacity())
                    .occupancyPercent(round(occPct))
                    .densityPerSqm(round(density))
                    .congestionLevel(congestionLevel)
                    .heatmapIntensity(heatmap)
                    .areaSquareMeters(zt.areaSqm())
                    .build());
        }
        return result;
    }

    public List<CongestionPoint> detectCongestion(List<ZoneData> zones) {
        List<CongestionPoint> points = new ArrayList<>();
        for (ZoneData z : zones) {
            if ("HIGH".equals(z.getCongestionLevel()) || "CRITICAL".equals(z.getCongestionLevel())) {
                String type = z.getFloor() == 0 ? "GROUND_FLOOR_BOTTLENECK" : "UPPER_FLOOR_CORRIDOR";
                String rec = "CRITICAL".equals(z.getCongestionLevel())
                        ? "Immediately redirect crowd flow. Open additional exits. Deploy security personnel."
                        : "Monitor closely. Consider staggered schedules to reduce peak load.";

                points.add(CongestionPoint.builder()
                        .location(z.getZoneName() + " (" + z.getBuildingName() + ")")
                        .type(type)
                        .severity(z.getHeatmapIntensity())
                        .affectedPeople(z.getCurrentOccupancy())
                        .recommendation(rec)
                        .build());
            }
        }
        // Always flag narrow corridors (Hardcoded logic from service)
        points.add(CongestionPoint.builder()
                .location("Stairwell A-B Junction (Academic Block 1)")
                .type("STAIRWELL_BOTTLENECK")
                .severity(0.75)
                .affectedPeople(120)
                .recommendation("Install crowd counter sensors; enforce one-way flow during peak.")
                .build());
        return points;
    }

    public EvacuationAnalysis calculateEvacuation(int totalPeople, int exitGates, String emergencyType) {
        double flowRatePerGate = "EARTHQUAKE".equals(emergencyType) ? 20.0 : 30.0;
        double totalFlowRate = flowRatePerGate * exitGates;
        double evacuationTimeSec = (totalPeople / totalFlowRate) * 60;

        double panicFactor = switch (emergencyType) {
            case "EARTHQUAKE" -> 1.4;
            case "BOMB_THREAT" -> 1.3;
            case "FLOOD" -> 1.2;
            default -> 1.15;
        };
        evacuationTimeSec *= panicFactor;
        double bottleneckPct = (panicFactor - 1.0) * 100;
        double evacuationTimeMin = evacuationTimeSec / 60.0;

        String rating = evacuationTimeMin <= 5 ? "EXCELLENT"
                : evacuationTimeMin <= 10 ? "GOOD" : evacuationTimeMin <= 15 ? "ACCEPTABLE" : "NEEDS_IMPROVEMENT";

        List<ExitGateDetail> gates = new ArrayList<>();
        String[] gateNames = { "Main Gate (South)", "Emergency Exit (East)", "Service Gate (North)",
                "Parking Gate (West)", "Hostel Gate", "Sports Exit" };
        int basePerGate = totalPeople / exitGates;
        int remainder = totalPeople % exitGates;

        for (int i = 0; i < exitGates; i++) {
            int assigned = basePerGate + (i < remainder ? 1 : 0);
            double gateTime = (assigned / flowRatePerGate) * 60 * panicFactor;
            gates.add(ExitGateDetail.builder()
                    .gateName(i < gateNames.length ? gateNames[i] : "Gate " + (i + 1))
                    .capacity((int) (flowRatePerGate * 2))
                    .assignedPeople(assigned)
                    .evacuationTimeSec(round(gateTime))
                    .status(gateTime < 300 ? "CLEAR" : gateTime < 600 ? "MODERATE" : "CONGESTED")
                    .build());
        }

        return EvacuationAnalysis.builder()
                .estimatedEvacuationTimeSec(round(evacuationTimeSec))
                .estimatedEvacuationTimeMin(round(evacuationTimeMin))
                .exitGatesAvailable(exitGates)
                .flowRatePersonsPerSec(round(totalFlowRate / 60))
                .bottleneckDelayPct(round(bottleneckPct))
                .emergencyType(emergencyType)
                .evacuationRating(rating)
                .exitGates(gates)
                .build();
    }

    public EmergencyReadiness calculateReadiness(double evacScore, double signageScore, double exitAccessScore,
            double drillScore, double fireEquipScore, List<String> improvements, List<String> strengths) {
        double overall = (evacScore * 0.30 + signageScore * 0.15 + exitAccessScore * 0.20 + drillScore * 0.15
                + fireEquipScore * 0.20);
        String grade = overall >= 85 ? "A" : overall >= 70 ? "B" : overall >= 55 ? "C" : "D";

        return EmergencyReadiness.builder()
                .overallScore(round(overall))
                .grade(grade)
                .evacuationScore(round(evacScore))
                .signageScore(round(signageScore))
                .exitAccessScore(round(exitAccessScore))
                .drillFrequencyScore(round(drillScore))
                .fireEquipmentScore(round(fireEquipScore))
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }

    public List<HourlyFlow> generateHourlyFlow(int maxOccupancy) {
        List<HourlyFlow> flows = new ArrayList<>();
        int prevOcc = (int) (maxOccupancy * HOURLY_OCCUPANCY[23]);
        for (int h = 0; h < 24; h++) {
            int occ = (int) (maxOccupancy * HOURLY_OCCUPANCY[h]);
            int inflow = Math.max(0, occ - prevOcc);
            int outflow = Math.max(0, prevOcc - occ);
            double congestionIdx = HOURLY_OCCUPANCY[h] >= 0.85 ? 0.9
                    : HOURLY_OCCUPANCY[h] >= 0.70 ? 0.7 : HOURLY_OCCUPANCY[h] >= 0.50 ? 0.5 : 0.2;
            flows.add(HourlyFlow.builder()
                    .hour(h)
                    .label(String.format("%02d:00", h))
                    .occupancy(occ)
                    .inflow(inflow)
                    .outflow(outflow)
                    .congestionIndex(round(congestionIdx))
                    .build());
            prevOcc = occ;
        }
        return flows;
    }

    private String getCongestionLevel(double occPct) {
        if (occPct >= 95)
            return "CRITICAL";
        if (occPct >= 80)
            return "HIGH";
        if (occPct >= 60)
            return "MODERATE";
        if (occPct >= 40)
            return "NORMAL";
        return "LOW";
    }

    private double getHeatmapIntensity(double occPct) {
        if (occPct >= 95)
            return 1.0;
        if (occPct >= 80)
            return 0.8;
        if (occPct >= 60)
            return 0.6;
        if (occPct >= 40)
            return 0.4;
        return 0.2;
    }

    private double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
