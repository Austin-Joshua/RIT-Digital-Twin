package com.university.erp.service;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.TimetableSlot;
import com.university.erp.model.TransportRoute;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.CampusRecordQuery;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;

/**
 * Deterministic Synthetic Telemetry Engine for RIT Digital Twin.
 * Generates reproducible, physics-and-schedule-grounded synthetic telemetry
 * across building power, room occupancy, crowd movement, transit status,
 * and environmental parameters.
 *
 * All values are labeled SourceClass.SIMULATED with provenance metadata
 * and are strictly kept separate from real IoT ingestion tables.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SyntheticTelemetryEngine {

    private static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Kolkata");
    private static final double PEAK_SOLAR_W_M2 = 850.0;
    private static final double MIN_TEMP_C = 23.5;
    private static final double MAX_TEMP_C = 35.0;

    private final BuildingRepository buildingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final CampusRecordQuery campusRecordQuery;
    private final ScenarioSimulationService scenarioSimulationService;

    /**
     * Generates a deterministic time-series curve for a specific metric and scenario.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> generateTimeSeries(String scenarioId, String metricType, int startHour, int endHour, int stepMinutes) {
        int safeStart = Math.max(6, Math.min(startHour, 22));
        int safeEnd = Math.max(safeStart + 1, Math.min(endHour, 23));
        int safeStep = Math.max(5, Math.min(stepMinutes, 60));

        List<Building> buildings = buildingRepository.findAll();
        List<Classroom> classrooms = classroomRepository.findAll();
        Map<String, Long> sectionCounts = getSectionCounts();

        double intakeMultiplier = getIntakeMultiplier(scenarioId);
        double hvacMultiplier = getHvacMultiplier(scenarioId);
        double loadMultiplier = getLoadMultiplier(scenarioId);

        List<Map<String, Object>> points = new ArrayList<>();
        for (int h = safeStart; h <= safeEnd; h++) {
            for (int m = 0; m < 60; m += safeStep) {
                if (h == safeEnd && m > 0) break;
                LocalTime clock = LocalTime.of(h, m);
                String timeLabel = String.format("%02d:%02d", h, m);

                double value = 0;
                double baseline = 0;
                String unit = "";

                switch (metricType != null ? metricType.toUpperCase(Locale.ROOT) : "ENERGY") {
                    case "CROWD_DENSITY" -> {
                        unit = "%";
                        double rawDensity = calculateCampusCrowd(clock, loadMultiplier, intakeMultiplier);
                        value = Math.round(rawDensity * 1000.0) / 10.0;
                        baseline = Math.round(calculateCampusCrowd(clock, 1.0, 1.0) * 1000.0) / 10.0;
                    }
                    case "TEMPERATURE" -> {
                        unit = "°C";
                        value = Math.round(calculateAmbientTemp(clock) * 10.0) / 10.0;
                        baseline = value;
                    }
                    case "SOLAR_IRRADIANCE" -> {
                        unit = "W/m²";
                        value = Math.round(calculateSolarIrradiance(clock) * 10.0) / 10.0;
                        baseline = value;
                    }
                    case "TRANSIT_PASSENGERS" -> {
                        unit = "riders";
                        value = calculateTransitRiders(clock, intakeMultiplier, scenarioId);
                        baseline = calculateTransitRiders(clock, 1.0, "normal-day");
                    }
                    case "ENERGY", "POWER", "ELECTRICAL_DEMAND" -> {
                        unit = "kW";
                        value = calculateTotalPower(buildings, clock, hvacMultiplier, loadMultiplier, scenarioId);
                        baseline = calculateTotalPower(buildings, clock, 1.0, 1.0, "normal-day");
                    }
                    default -> {
                        unit = "kW";
                        value = calculateTotalPower(buildings, clock, hvacMultiplier, loadMultiplier, scenarioId);
                        baseline = calculateTotalPower(buildings, clock, 1.0, 1.0, "normal-day");
                    }
                }

                Map<String, Object> point = new LinkedHashMap<>();
                point.put("timestamp", timeLabel);
                point.put("value", value);
                point.put("baseline", baseline);
                point.put("unit", unit);
                points.add(point);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("metricType", metricType);
        response.put("scenarioId", scenarioId != null ? scenarioId : "normal-day");
        response.put("source", SourceClass.SIMULATED.name());
        response.put("provenance", "SYNTHETIC");
        response.put("points", points);
        response.put("because", "Deterministic time-series generated from scheduled timetable, diurnal curves, and scenario levers.");
        return response;
    }

    /**
     * Generates an overview map payload keyed by building ID for CampusMap3D and 3D visualization.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCampusOverview(String scenarioId, LocalTime clockTime) {
        LocalTime clock = clockTime != null ? clockTime : LocalTime.now(CAMPUS_ZONE);
        List<Building> buildings = buildingRepository.findAll();
        double hvacMultiplier = getHvacMultiplier(scenarioId);
        double loadMultiplier = getLoadMultiplier(scenarioId);
        double intakeMultiplier = getIntakeMultiplier(scenarioId);

        Map<String, Object> overview = new LinkedHashMap<>();
        for (Building b : buildings) {
            String bId = b.getName();
            double base = b.getBaseEnergyLoad() != null ? b.getBaseEnergyLoad().doubleValue() : 25.0;
            
            // Check building closure scenario
            boolean isClosed = "building-closure".equalsIgnoreCase(scenarioId) 
                    && (b.getName().toLowerCase().contains("mech") || b.getName().toLowerCase().contains("civil"));
            
            double activeClassFraction = isClosed ? 0.0 : getBuildingClassFraction(b.getId(), clock) * loadMultiplier;
            double buildingKw = isClosed ? (base * 0.2) : (base + (activeClassFraction * 5.5 * hvacMultiplier));
            double buildingCrowd = isClosed ? 0.0 : Math.min(1.2, activeClassFraction * 0.85 * intakeMultiplier);
            double buildingTemp = calculateAmbientTemp(clock) + (isClosed ? 0.0 : (activeClassFraction * 0.8));

            Map<String, Object> telemetry = new LinkedHashMap<>();
            telemetry.put("power", Math.round(buildingKw * 10.0) / 10.0);
            telemetry.put("powerUnit", "kW");
            telemetry.put("occupancy", Math.round(activeClassFraction * 100.0) / 100.0);
            telemetry.put("crowd", Math.round(buildingCrowd * 100.0) / 100.0);
            telemetry.put("temperature", Math.round(buildingTemp * 10.0) / 10.0);
            telemetry.put("status", isClosed ? "MAINTENANCE_CLOSED" : "OPERATIONAL");
            telemetry.put("air_quality", isClosed ? 25 : Math.round(40 + (buildingCrowd * 45)));
            telemetry.put("machinery_vibration", isClosed ? 5 : 22);

            overview.put(bId, telemetry);
        }

        Map<String, Object> envelope = new LinkedHashMap<>();
        envelope.put("timestamp", LocalDateTime.now(CAMPUS_ZONE).toString());
        envelope.put("simulatedClock", clock.toString());
        envelope.put("scenario", scenarioId != null ? scenarioId : "normal-day");
        envelope.put("provenance", "SYNTHETIC");
        envelope.put("source", SourceClass.SIMULATED.name());
        envelope.put("buildings", overview);
        envelope.put("solarIrradiance", Math.round(calculateSolarIrradiance(clock) * 10.0) / 10.0);
        envelope.put("ambientTemperature", Math.round(calculateAmbientTemp(clock) * 10.0) / 10.0);
        return envelope;
    }

    /**
     * Evaluates total campus electrical demand (kW) deterministically.
     */
    private double calculateTotalPower(List<Building> buildings, LocalTime clock, double hvacMult, double loadMult, String scenarioId) {
        double total = 0;
        for (Building b : buildings) {
            double base = b.getBaseEnergyLoad() != null ? b.getBaseEnergyLoad().doubleValue() : 25.0;
            boolean isClosed = "building-closure".equalsIgnoreCase(scenarioId) 
                    && (b.getName().toLowerCase().contains("mech") || b.getName().toLowerCase().contains("civil"));
            if (isClosed) {
                total += base * 0.2;
                continue;
            }
            double classFraction = getBuildingClassFraction(b.getId(), clock) * loadMult;
            double kw = base + (classFraction * 5.5 * hvacMult);
            total += kw;
        }
        return Math.round(total * 10.0) / 10.0;
    }

    /**
     * Determines scheduled class concurrency fraction for a building at clock time.
     */
    private double getBuildingClassFraction(Long buildingId, LocalTime clock) {
        int hour = clock.getHour();
        int min = clock.getMinute();
        // Academic hours: 08:30 to 16:30
        if (hour < 8 || hour >= 17) return 0.05;
        if (hour == 8 && min < 30) return 0.2;
        if (hour == 12 && min >= 30 || hour == 13 && min < 30) return 0.25; // Lunch lull
        // Normal class peak
        double hashFactor = (buildingId != null ? (buildingId * 17 % 10) / 20.0 : 0.0);
        return Math.min(1.0, 0.65 + hashFactor);
    }

    /**
     * Campus crowd density index (0.0 to 1.0+).
     */
    private double calculateCampusCrowd(LocalTime clock, double loadMult, double intakeMult) {
        int h = clock.getHour();
        int m = clock.getMinute();
        if (h < 8 || h >= 18) return 0.08 * intakeMult;
        // Peak arrival: 08:30 - 09:15
        if (h == 8 && m >= 30 || h == 9 && m <= 15) return Math.min(1.2, 0.92 * loadMult * intakeMult);
        // Lunch migration: 12:45 - 13:30
        if (h == 12 && m >= 45 || h == 13 && m <= 30) return Math.min(1.15, 0.88 * loadMult * intakeMult);
        // Dismissal: 16:15 - 17:00
        if (h == 16 && m >= 15 || h == 17 && m <= 0) return Math.min(1.25, 0.95 * loadMult * intakeMult);
        return Math.min(1.0, 0.62 * loadMult * intakeMult);
    }

    /**
     * Diurnal temperature calculation using sinusoidal solar heating model.
     */
    private double calculateAmbientTemp(LocalTime clock) {
        double hourFrac = clock.getHour() + clock.getMinute() / 60.0;
        if (hourFrac < 6.0 || hourFrac > 20.0) {
            return MIN_TEMP_C;
        }
        double angle = Math.PI * (hourFrac - 6.0) / 14.0;
        return MIN_TEMP_C + (MAX_TEMP_C - MIN_TEMP_C) * Math.sin(angle);
    }

    /**
     * Solar Irradiance (W/m2) using solar elevation angle approximation.
     */
    private double calculateSolarIrradiance(LocalTime clock) {
        double hourFrac = clock.getHour() + clock.getMinute() / 60.0;
        if (hourFrac < 6.5 || hourFrac > 18.0) return 0.0;
        double angle = Math.PI * (hourFrac - 6.5) / 11.5;
        return Math.max(0.0, PEAK_SOLAR_W_M2 * Math.sin(angle));
    }

    /**
     * Transit passenger volume.
     */
    private double calculateTransitRiders(LocalTime clock, double intakeMult, String scenarioId) {
        int h = clock.getHour();
        int m = clock.getMinute();
        double baseRiders = 450.0 * intakeMult;
        // Surge in morning (07:30 - 08:45) and evening (16:30 - 17:45)
        if (h == 8 && m < 45 || h == 7 && m >= 30) {
            return Math.round(baseRiders * 1.85);
        }
        if (h == 16 && m >= 30 || h == 17 && m <= 45) {
            return Math.round(baseRiders * 1.70);
        }
        if (h >= 9 && h <= 16) {
            return Math.round(baseRiders * 0.25);
        }
        return 0;
    }

    private double getIntakeMultiplier(String scenarioId) {
        if ("peak-demand".equalsIgnoreCase(scenarioId)) return 1.20;
        if ("classroom-demand-up".equalsIgnoreCase(scenarioId)) return 1.25;
        if ("emergency-crowd".equalsIgnoreCase(scenarioId)) return 0.90;
        return 1.0;
    }

    private double getHvacMultiplier(String scenarioId) {
        if ("energy-saving".equalsIgnoreCase(scenarioId)) return 0.65; // 35% reduction
        if ("exam-day".equalsIgnoreCase(scenarioId)) return 0.90; // 10% reduction
        if ("building-closure".equalsIgnoreCase(scenarioId)) return 0.85;
        return 1.0;
    }

    private double getLoadMultiplier(String scenarioId) {
        if ("exam-day".equalsIgnoreCase(scenarioId)) return 1.25;
        if ("peak-demand".equalsIgnoreCase(scenarioId)) return 1.30;
        if ("classroom-demand-up".equalsIgnoreCase(scenarioId)) return 1.20;
        if ("energy-saving".equalsIgnoreCase(scenarioId)) return 0.85;
        if ("emergency-crowd".equalsIgnoreCase(scenarioId)) return 0.80;
        return 1.0;
    }

    private Map<String, Long> getSectionCounts() {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : campusRecordQuery.countStudentsBySection()) {
            if (row[0] != null && row[1] instanceof Number num) {
                map.put(String.valueOf(row[0]), num.longValue());
            }
        }
        return map;
    }
}
