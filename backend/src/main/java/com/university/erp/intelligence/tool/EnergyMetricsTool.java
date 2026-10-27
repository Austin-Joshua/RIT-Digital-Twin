package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.DigitalTwinMetricsRepository;
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
public class EnergyMetricsTool implements CampusTool {

    private static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Kolkata");

    private final BuildingRepository buildingRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final DigitalTwinMetricsRepository metricsRepository;

    @Override
    public String name() {
        return "get_energy_metrics";
    }

    @Override
    public String description() {
        return "Calculates campus and building electrical demand from the authoritative energy formula (base load + 5.5 kW per class) and compares with stored samples.";
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
        List<TimetableSlot> todaySlots = timetableSlotRepository.findByDayOfWeekIgnoreCase(dayName);
        LocalTime currentTime = now.toLocalTime();

        List<List<Object>> tableRows = new ArrayList<>();
        double totalDemandKw = 0.0;
        double totalBaseKw = 0.0;
        String highestConsumer = "None";
        double maxBuildingLoad = 0.0;

        for (Building b : buildings) {
            double base = b.getBaseEnergyLoad() != null ? b.getBaseEnergyLoad().doubleValue() : 0.0;
            totalBaseKw += base;

            long activeInB = todaySlots.stream()
                    .filter(s -> s.getClassroom() != null && s.getClassroom().getBuilding() != null && b.getId().equals(s.getClassroom().getBuilding().getId()))
                    .filter(s -> covers(s, currentTime))
                    .count();

            double bDemand = EnergyFormula.round(base + (activeInB * EnergyFormula.CLASS_KW));
            totalDemandKw += bDemand;

            if (bDemand > maxBuildingLoad) {
                maxBuildingLoad = bDemand;
                highestConsumer = b.getName() + " (" + bDemand + " kW)";
            }

            tableRows.add(List.of(
                    b.getName(),
                    b.getCode(),
                    b.getBaseEnergyLoad() != null ? base + " kW" : "N/A",
                    activeInB,
                    activeInB * EnergyFormula.CLASS_KW + " kW",
                    bDemand + " kW"
            ));
        }

        totalDemandKw = EnergyFormula.round(totalDemandKw);

        // Retrieve historical samples for trend analysis
        List<DigitalTwinMetrics> samples = metricsRepository.findTop50ByMetricTypeOrderByTimestampDesc("ENERGY_DEMAND").stream()
                .filter(s -> s.getValue() != null)
                .toList();

        String trendSummary;
        if (samples.size() >= 2) {
            double latest = samples.get(0).getValue();
            double prev = samples.get(1).getValue();
            double diff = EnergyFormula.round(latest - prev);
            if (diff > 0) {
                trendSummary = String.format(" Latest stored formula sample (%.1f kW) is +%.1f kW higher than previous sample (%.1f kW) due to active timetable load.", latest, diff, prev);
            } else if (diff < 0) {
                trendSummary = String.format(" Latest stored formula sample (%.1f kW) is %.1f kW lower than previous sample (%.1f kW) as class sessions concluded.", latest, Math.abs(diff), prev);
            } else {
                trendSummary = String.format(" Stored formula load is stable at %.1f kW.", latest);
            }
        } else {
            trendSummary = " Insufficient historical formula samples stored to compute trend rate.";
        }

        String answer = String.format(
                "Campus Electrical Energy Demand for %s (%02d:%02d Asia/Kolkata): Total estimated load is %.1f kW (Base load: %.1f kW, Class HVAC/Lighting load: %.1f kW across %d buildings). Highest consumer: %s.%s (Note: Computed via base load + 5.5 kW per active class formula. No physical hardware power meters are connected).",
                dayDisplay, now.getHour(), now.getMinute(), totalDemandKw, totalBaseKw, totalDemandKw - totalBaseKw, buildings.size(), highestConsumer, trendSummary
        );

        return ToolResult.builder(name())
                .answer(answer)
                .sourceClass(SourceClass.SIMULATED)
                .because("Calculated via building base loads plus 5.5 kW per active scheduled class. Not a hardware meter reading.")
                .addCard("Campus Total Load", totalDemandKw, "kW", "SIMULATED", "bolt")
                .addCard("Campus Base Load", totalBaseKw, "kW", "CONFIGURED", "power")
                .addCard("Active Class Load", EnergyFormula.round(totalDemandKw - totalBaseKw), "kW", "SIMULATED", "sun")
                .addCard("Peak Consumer", highestConsumer, "Max kW", "SIMULATED", "activity")
                .table(List.of("Building", "Code", "Base Load", "Active Classes", "Class Add (kW)", "Total Formula (kW)"), tableRows)
                .addAction("VIEW", "Energy Optimization", "/simulations/energy")
                .addAction("SIMULATE", "Run HVAC Scenario", "/simulations")
                .addCitation("Digital Twin Energy Specification v2.4, §1.0", "§1.0", "Base load + 5.5 kW/class. No physical meter series.")
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
