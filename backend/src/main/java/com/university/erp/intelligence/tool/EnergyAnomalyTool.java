package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;

@Component
@RequiredArgsConstructor
public class EnergyAnomalyTool implements CampusTool {

    private static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Kolkata");
    private static final double STATISTICAL_DEVIATION_THRESHOLD = 35.0; // % above nominal

    private final BuildingRepository buildingRepository;
    private final TimetableSlotRepository timetableSlotRepository;

    @Override
    public String name() {
        return "detect_energy_anomalies";
    }

    @Override
    public String description() {
        return "Detects statistical energy and load anomalies across campus buildings by comparing current timetable-driven power demand against nominal baseline operating curves.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        LocalDateTime now = LocalDateTime.now(CAMPUS_ZONE);
        String dayName = now.getDayOfWeek().name();
        String dayDisplay = now.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<Building> buildings = buildingRepository.findAll();
        List<TimetableSlot> allDaySlots = timetableSlotRepository.findByDayOfWeekIgnoreCase(dayName);
        LocalTime currentTime = now.toLocalTime();

        // Calculate nominal average classes per hour for normalization
        long totalDayClasses = allDaySlots.size();
        double avgClassesPerHour = Math.max(1.0, (double) totalDayClasses / 8.0);

        List<List<Object>> tableRows = new ArrayList<>();
        List<String> anomalyDescriptions = new ArrayList<>();
        int anomalyCount = 0;

        for (Building b : buildings) {
            double base = b.getBaseEnergyLoad() != null ? b.getBaseEnergyLoad().doubleValue() : 0.0;
            if (base <= 0) continue;

            long currentClasses = allDaySlots.stream()
                    .filter(s -> s.getClassroom() != null && s.getClassroom().getBuilding() != null && b.getId().equals(s.getClassroom().getBuilding().getId()))
                    .filter(s -> covers(s, currentTime))
                    .count();

            long totalBClassesToday = allDaySlots.stream()
                    .filter(s -> s.getClassroom() != null && s.getClassroom().getBuilding() != null && b.getId().equals(s.getClassroom().getBuilding().getId()))
                    .count();

            double nominalBClasses = (double) totalBClassesToday / 8.0;
            double nominalKw = EnergyFormula.round(base + (nominalBClasses * EnergyFormula.CLASS_KW));
            double currentKw = EnergyFormula.round(base + (currentClasses * EnergyFormula.CLASS_KW));

            double deviationPct = nominalKw > 0 ? EnergyFormula.round(((currentKw - nominalKw) / nominalKw) * 100.0) : 0.0;
            boolean isAnomaly = deviationPct >= STATISTICAL_DEVIATION_THRESHOLD;

            String classification = isAnomaly ? "STATISTICAL ANOMALY (ELEVATED)" : "NORMAL OPERATING RANGE";
            if (isAnomaly) {
                anomalyCount++;
                anomalyDescriptions.add(String.format(
                        "%s (+%.1f%% above nominal: %.1f kW current vs %.1f kW nominal baseline, driven by %d concurrent classes)",
                        b.getName(), deviationPct, currentKw, nominalKw, currentClasses
                ));
            }

            tableRows.add(List.of(
                    b.getName(),
                    currentKw + " kW",
                    nominalKw + " kW",
                    (deviationPct >= 0 ? "+" : "") + deviationPct + "%",
                    currentClasses + " / " + totalBClassesToday,
                    classification
            ));
        }

        String summary;
        if (anomalyCount > 0) {
            summary = String.format(
                    "Energy Anomaly Audit for %s at %02d:%02d Asia/Kolkata: Detected %d statistical load anomalies: %s. Note: These are statistical variations driven by scheduled class clustering, not confirmed physical meter faults. Recommendation: Consider redistributing concurrent section bookings across afternoon slots to flatten the electrical peak.",
                    dayDisplay, now.getHour(), now.getMinute(), anomalyCount, String.join("; ", anomalyDescriptions)
            );
        } else {
            summary = String.format(
                    "Energy Anomaly Audit for %s at %02d:%02d Asia/Kolkata: All campus buildings operate within normal statistical baseline tolerance (<%.0f%% deviation). No abnormal energy spikes or scheduled overload detected across buildings.",
                    dayDisplay, now.getHour(), now.getMinute(), STATISTICAL_DEVIATION_THRESHOLD
            );
        }

        return ToolResult.builder(name())
                .answer(summary)
                .sourceClass(SourceClass.ESTIMATED)
                .because("Compared current hourly timetable demand against the building's 8-hour nominal average baseline.")
                .addCard("Anomalies Detected", anomalyCount, "statistical", anomalyCount > 0 ? "ELEVATED" : "NORMAL", anomalyCount > 0 ? "alert-triangle" : "check")
                .addCard("Deviation Threshold", STATISTICAL_DEVIATION_THRESHOLD + "%", "tolerance", "CONFIGURED", "sliders")
                .addCard("Buildings Analyzed", buildings.size(), "structures", "CONFIGURED", "building")
                .table(List.of("Building", "Current Demand", "Nominal Baseline", "Deviation %", "Classes (Now / Day)", "Classification"), tableRows)
                .addAction("VIEW", "Energy Optimization", "/simulations/energy")
                .addAction("SIMULATE", "Run Scenario Lab", "/simulations")
                .addCitation("Digital Twin Energy Specification v2.4, §1.0", "§1.0", "Formula baseline comparison. No hardware sensor fault inferred.")
                .build();
    }

    private static boolean covers(TimetableSlot slot, LocalTime time) {
        if (slot.getStartTime() == null || slot.getEndTime() == null) return false;
        try {
            LocalTime start = LocalTime.parse(slot.getStartTime().trim());
            LocalTime end = LocalTime.parse(slot.getEndTime().trim());
            return !time.isBefore(start) && time.isBefore(end);
        } catch (Exception e) {
            return false;
        }
    }
}
