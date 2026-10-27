package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Classroom;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.CampusRecordQuery;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;

@Component
@RequiredArgsConstructor
public class RoomOccupancyTool implements CampusTool {

    private static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Kolkata");

    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final CampusRecordQuery campusRecordQuery;

    @Override
    public String name() {
        return "get_room_occupancy";
    }

    @Override
    public String description() {
        return "Analyzes current or scheduled classroom occupancy and crowding based on timetable allocations and student section sizes.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        LocalDate day = dayFromParams(params);
        LocalTime time = timeFromParams(params);
        String dayName = day.getDayOfWeek().name();
        String dayDisplay = day.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<Classroom> classrooms = classroomRepository.findAllWithBuilding();
        List<TimetableSlot> slots = timetableSlotRepository.findByDayOfWeekIgnoreCase(dayName);

        Map<String, Long> sectionSizes = new HashMap<>();
        for (Object[] row : campusRecordQuery.countStudentsBySection()) {
            if (row[0] != null && row[1] instanceof Number num) {
                sectionSizes.put(String.valueOf(row[0]), num.longValue());
            }
        }

        List<List<Object>> tableRows = new ArrayList<>();
        int totalOccupied = 0;
        int crowdedCount = 0;
        double maxDensity = 0.0;
        String mostCrowdedRoom = "None";

        for (Classroom room : classrooms) {
            String bName = room.getBuilding() != null ? room.getBuilding().getName() : "Unassigned";
            int cap = room.getCapacity() != null ? room.getCapacity() : 0;

            // Find slot covering this room at the target time
            TimetableSlot activeSlot = slots.stream()
                    .filter(s -> s.getClassroom() != null && room.getId().equals(s.getClassroom().getId()))
                    .filter(s -> covers(s, time))
                    .findFirst()
                    .orElse(null);

            if (activeSlot != null) {
                totalOccupied++;
                long enrolled = sectionSizes.getOrDefault(activeSlot.getSection(), 0L);
                double density = cap > 0 ? (enrolled / (double) cap) * 100.0 : 0.0;

                if (density > maxDensity) {
                    maxDensity = density;
                    mostCrowdedRoom = room.getName() + " (" + Math.round(density) + "%)";
                }
                if (density >= 90.0) {
                    crowdedCount++;
                }

                String status = density >= 100.0 ? "OVER CAPACITY" : density >= 85.0 ? "HIGH LOAD" : "OPTIMAL";
                tableRows.add(List.of(
                        room.getName(),
                        bName,
                        cap,
                        activeSlot.getSection() != null ? activeSlot.getSection() : "N/A",
                        enrolled,
                        Math.round(density) + "%",
                        status
                ));
            } else {
                tableRows.add(List.of(
                        room.getName(),
                        bName,
                        cap,
                        "VACANT",
                        0,
                        "0%",
                        "FREE"
                ));
            }
        }

        int vacantCount = classrooms.size() - totalOccupied;
        String answer = String.format(
                "Classroom Occupancy for %s at %02d:%02d Asia/Kolkata: %d of %d rooms have scheduled classes (%d vacant). %d room(s) operate at or above 90%% scheduled capacity. Highest scheduled density: %s. (Note: Derived from timetable slots and section enrollment; no hardware door/PIR presence sensor is installed).",
                dayDisplay, time.getHour(), time.getMinute(), totalOccupied, classrooms.size(), vacantCount, crowdedCount, mostCrowdedRoom
        );

        return ToolResult.builder(name())
                .answer(answer)
                .sourceClass(SourceClass.ESTIMATED)
                .because("Derived from registered section sizes against classroom capacity for the active timetable slot.")
                .addCard("Occupied Rooms", totalOccupied, "in session", "ESTIMATED", "door")
                .addCard("Vacant Rooms", vacantCount, "free", "ESTIMATED", "check")
                .addCard("High Load Rooms", crowdedCount, "≥90% cap", "ALERT", "alert")
                .addCard("Peak Density", Math.round(maxDensity) + "%", mostCrowdedRoom, "ESTIMATED", "trending-up")
                .table(List.of("Room", "Building", "Capacity", "Section", "Scheduled", "Occupancy %", "Status"), tableRows)
                .addAction("VIEW", "Classroom Allocation", "/classrooms/allocation")
                .addAction("VIEW", "Simulation Lab", "/simulations")
                .addCitation("Campus Space Optimization Manual, §3.2", "§3.2", "Target utilization 65-80%. Over 85% is congested.")
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

    private static LocalDate dayFromParams(Map<String, Object> params) {
        if (params != null && params.get("day") != null) {
            String d = String.valueOf(params.get("day")).toUpperCase(Locale.ROOT);
            for (DayOfWeek day : DayOfWeek.values()) {
                if (day.name().contains(d)) {
                    return LocalDate.now(CAMPUS_ZONE).with(day);
                }
            }
        }
        return LocalDate.now(CAMPUS_ZONE);
    }

    private static LocalTime timeFromParams(Map<String, Object> params) {
        if (params != null && params.get("time") != null) {
            try {
                return LocalTime.parse(String.valueOf(params.get("time")).trim());
            } catch (Exception ignored) {}
        }
        return LocalTime.now(CAMPUS_ZONE);
    }
}
