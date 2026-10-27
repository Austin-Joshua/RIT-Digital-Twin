package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.service.CampusStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CampusOverviewTool implements CampusTool {

    private static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Kolkata");

    private final BuildingRepository buildingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final CampusStateService campusStateService;

    @Override
    public String name() {
        return "get_campus_overview";
    }

    @Override
    public String description() {
        return "Retrieves the high-level operational overview of the campus digital twin including total buildings, classrooms, active classes, scheduled energy formula load, and current alerts.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        LocalDateTime now = LocalDateTime.now(CAMPUS_ZONE);
        String dayName = now.getDayOfWeek().name();
        String dayDisplay = now.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<Building> buildings = buildingRepository.findAll();
        List<Classroom> classrooms = classroomRepository.findAll();
        List<TimetableSlot> todaySlots = timetableSlotRepository.findByDayOfWeekIgnoreCase(dayName);

        LocalTime currentTime = now.toLocalTime();
        long activeClasses = todaySlots.stream()
                .filter(slot -> covers(slot, currentTime))
                .count();

        int totalCapacity = classrooms.stream()
                .mapToInt(c -> c.getCapacity() != null ? c.getCapacity() : 0)
                .sum();

        // Calculate formula energy load
        double totalBaseEnergy = buildings.stream()
                .filter(b -> b.getBaseEnergyLoad() != null)
                .mapToDouble(b -> b.getBaseEnergyLoad().doubleValue())
                .sum();
        double formulaDemand = EnergyFormula.round(totalBaseEnergy + (activeClasses * EnergyFormula.CLASS_KW));

        // Get alerts count from campus state
        Map<String, Object> state = campusStateService.current();
        int alertCount = 0;
        if (state.get("alertCenter") instanceof Map<?, ?> center && center.get("alerts") instanceof List<?> list) {
            alertCount = (int) list.stream().filter(a -> a instanceof Map<?, ?> m && !"RESOLVED".equals(m.get("status"))).count();
        }

        String summary = String.format(
                "RIT Campus Overview as of %s at %02d:%02d Asia/Kolkata: %d buildings, %d classrooms (total capacity %d seats), %d active scheduled classes right now. Campus electrical formula demand is %.1f kW (%s). %d open operational alerts are recorded.",
                dayDisplay, now.getHour(), now.getMinute(), buildings.size(), classrooms.size(), totalCapacity, activeClasses, formulaDemand,
                totalBaseEnergy > 0 ? "base load plus 5.5 kW/class" : "no base load recorded", alertCount
        );

        List<List<Object>> tableRows = new ArrayList<>();
        for (Building b : buildings) {
            long bClasses = classrooms.stream().filter(c -> c.getBuilding() != null && b.getId().equals(c.getBuilding().getId())).count();
            int bCap = classrooms.stream().filter(c -> c.getBuilding() != null && b.getId().equals(c.getBuilding().getId())).mapToInt(c -> c.getCapacity() != null ? c.getCapacity() : 0).sum();
            tableRows.add(List.of(
                    b.getName(),
                    b.getCode(),
                    bClasses,
                    bCap,
                    b.getBaseEnergyLoad() != null ? b.getBaseEnergyLoad() + " kW" : "N/A"
            ));
        }

        return ToolResult.builder(name())
                .answer(summary)
                .sourceClass(SourceClass.ESTIMATED)
                .because("Assembled from verified database tables and the timetable grid at current campus clock.")
                .addCard("Campus Buildings", buildings.size(), "facilities", "CONFIGURED", "building")
                .addCard("Total Classrooms", classrooms.size(), "rooms", "CONFIGURED", "door")
                .addCard("Active Classes", activeClasses, "sessions", "ESTIMATED", "users")
                .addCard("Formula Demand", formulaDemand, "kW", "SIMULATED", "bolt")
                .addCard("Open Alerts", alertCount, "active", "ESTIMATED", "alert")
                .table(List.of("Building", "Code", "Rooms", "Capacity", "Base Load"), tableRows)
                .addAction("VIEW", "Open Campus Map", "/map")
                .addAction("VIEW", "Open Analytics", "/analytics")
                .addAction("VIEW", "View Simulations", "/simulations")
                .addCitation("Campus Operating Procedures (Rev. 2026), §2.1", "§2.1", "Class hours 08:30-16:30, 8 periods daily.")
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
