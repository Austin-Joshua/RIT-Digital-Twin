package com.university.erp.service;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.Role;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.AttendanceRepository;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.CampusRecordQuery;
import com.university.erp.repository.MarksRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.repository.TransportRouteRepository;
import com.university.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CampusCommandService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");

    private final BuildingRepository buildingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final StudentRepository studentRepository;
    private final CampusRecordQuery campusRecordQuery;
    private final UserRepository userRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final PredictiveEngine predictiveEngine;

    @Transactional(readOnly = true)
    public Map<String, Object> snapshot() {
        LocalDateTime now = LocalDateTime.now(CAMPUS);
        Map<String, Long> sectionCounts = sectionCounts();
        List<Classroom> rooms = classroomRepository.findAllWithBuilding();
        List<TimetableSlot> today = timetableSlotRepository.findByDayOfWeekIgnoreCase(now.getDayOfWeek().name());
        List<TimetableSlot> tomorrow = timetableSlotRepository.findByDayOfWeekIgnoreCase(nextTeachingDay(now.getDayOfWeek()).name());

        List<Map<String, Object>> buildings = buildings(rooms, today, sectionCounts, now);
        List<Map<String, Object>> alerts = alerts(today, sectionCounts, now);
        Map<String, Object> indicators = indicators(rooms, today, sectionCounts, now, alerts.size());
        List<Map<String, Object>> health = health(indicators, alerts);
        List<Map<String, Object>> timeline = timeline(today, tomorrow, rooms, sectionCounts, now);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("asOf", now.toString());
        body.put("timezone", CAMPUS.getId());
        body.put("source", SourceClass.ESTIMATED.name());
        body.put("because", "Scheduled classes and stored academic records. This is not a live sensor feed.");
        body.put("health", health);
        body.put("overall", overall(health));
        body.put("indicators", indicators);
        body.put("timeline", timeline);
        body.put("alerts", alerts);
        body.put("buildings", buildings);
        body.put("models", models());
        return body;
    }

    private Map<String, Long> sectionCounts() {
        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : campusRecordQuery.countStudentsBySection()) {
            if (row[0] != null && row[1] instanceof Number number) {
                counts.put(String.valueOf(row[0]), number.longValue());
            }
        }
        return counts;
    }

    private List<Map<String, Object>> buildings(List<Classroom> rooms, List<TimetableSlot> today,
                                                Map<String, Long> sectionCounts, LocalDateTime now) {
        Map<Long, Map<String, Object>> byBuilding = new LinkedHashMap<>();
        for (Building building : buildingRepository.findAll()) {
            byBuilding.put(building.getId(), buildingShell(building));
        }
        for (Classroom room : rooms) {
            if (room.getBuilding() == null || room.getBuilding().getId() == null) {
                continue;
            }
            byBuilding.computeIfAbsent(room.getBuilding().getId(), id -> buildingShell(room.getBuilding()));
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> roomRows = (List<Map<String, Object>>) byBuilding.get(room.getBuilding().getId()).get("rooms");
            roomRows.add(roomRow(room, today, sectionCounts, now));
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> building : byBuilding.values()) {
            summarizeBuilding(building);
            result.add(building);
        }
        result.sort(Comparator.comparing(row -> String.valueOf(row.get("name"))));
        return result;
    }

    private Map<String, Object> buildingShell(Building building) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", building.getId());
        row.put("name", building.getName());
        row.put("code", building.getCode());
        row.put("source", SourceClass.ESTIMATED.name());
        row.put("energyKw", energyKw(building, 0));
        row.put("energySource", building.getBaseEnergyLoad() == null ? null : SourceClass.SIMULATED.name());
        row.put("rooms", new ArrayList<Map<String, Object>>());
        return row;
    }

    private Map<String, Object> roomRow(Classroom room, List<TimetableSlot> today,
                                        Map<String, Long> sectionCounts, LocalDateTime now) {
        List<TimetableSlot> here = today.stream().filter(slot -> sameRoom(slot, room.getId())).toList();
        TimetableSlot active = here.stream().filter(slot -> contains(slot, now.toLocalTime())).findFirst().orElse(null);
        long students = active == null ? 0 : sectionCounts.getOrDefault(active.getSection(), 0L);
        Double density = density(students, room.getCapacity());
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", room.getId());
        row.put("name", room.getName());
        row.put("capacity", room.getCapacity());
        row.put("active", active != null);
        row.put("subject", active == null || active.getSubject() == null ? null : active.getSubject().getSubjectName());
        row.put("section", active == null ? null : active.getSection());
        row.put("scheduledStudents", active == null ? null : students);
        row.put("density", density);
        row.put("slotsToday", here.size());
        row.put("source", SourceClass.ESTIMATED.name());
        return row;
    }

    private void summarizeBuilding(Map<String, Object> building) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rooms = (List<Map<String, Object>>) building.get("rooms");
        long active = rooms.stream().filter(room -> Boolean.TRUE.equals(room.get("active"))).count();
        long scheduledStudents = rooms.stream()
                .map(room -> room.get("scheduledStudents"))
                .filter(Number.class::isInstance)
                .mapToLong(value -> ((Number) value).longValue())
                .sum();
        Double peak = rooms.stream()
                .map(room -> room.get("density"))
                .filter(Number.class::isInstance)
                .map(value -> ((Number) value).doubleValue())
                .max((left, right) -> Double.compare(left, right))
                .orElse(null);
        building.put("activeClasses", active);
        building.put("availableRooms", rooms.size() - active);
        building.put("scheduledStudents", scheduledStudents);
        building.put("peakDensity", peak);
        building.put("utilization", rooms.isEmpty() ? null : round(active * 100.0 / rooms.size()));
        Number storedBase = building.get("energyKw") instanceof Number number ? number : null;
        if (storedBase != null) {
            building.put("energyKw", EnergyFormula.kw(java.math.BigDecimal.valueOf(storedBase.doubleValue()), active));
            building.put("energySource", SourceClass.SIMULATED.name());
            building.put("energyBecause", EnergyFormula.BECAUSE);
        } else {
            building.put("energyKw", null);
            building.put("energySource", null);
            building.put("energyBecause", EnergyFormula.UNAVAILABLE);
        }
    }

    private List<Map<String, Object>> alerts(List<TimetableSlot> today, Map<String, Long> sectionCounts, LocalDateTime now) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        LocalTime limit = now.toLocalTime().plusMinutes(30);
        for (TimetableSlot slot : today) {
            if (slot.getClassroom() == null) {
                continue;
            }
            boolean active = contains(slot, now.toLocalTime());
            LocalTime start = parseTime(slot.getStartTime());
            boolean soon = start != null && !start.isBefore(now.toLocalTime()) && !start.isAfter(limit);
            if (!active && !soon) {
                continue;
            }
            long students = sectionCounts.getOrDefault(slot.getSection(), 0L);
            Double density = density(students, slot.getClassroom().getCapacity());
            if (density == null || density < 0.85) {
                continue;
            }
            String room = slot.getClassroom().getName();
            String building = slot.getClassroom().getBuilding() == null ? "Unassigned building" : slot.getClassroom().getBuilding().getName();
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("priority", density > 1 ? "HIGH" : "MODERATE");
            alert.put("buildingId", slot.getClassroom().getBuilding() == null ? null : slot.getClassroom().getBuilding().getId());
            alert.put("title", building + " · " + room + (active ? " is over the scheduled fit" : " is tight in the next 30 minutes"));
            alert.put("why", "Section " + slot.getSection() + " has " + students + " students against room capacity "
                    + slot.getClassroom().getCapacity() + ".");
            alert.put("impact", "Scheduled density is " + Math.round(density * 100) + "% of room capacity.");
            alert.put("when", active ? "In progress" : "Starts at " + slot.getStartTime());
            alert.put("densityPercent", Math.round(density * 100));
            alert.put("roomId", slot.getClassroom().getId());
            alert.put("room", room);
            alert.put("building", building);
            alert.put("action", "Check this section against the room before the slot. No corridor sensor is available to redirect foot traffic.");
            alert.put("source", SourceClass.ESTIMATED.name());
            alerts.add(alert);
        }
        alerts.sort(Comparator.comparing(row -> "HIGH".equals(row.get("priority")) ? 0 : 1));
        return alerts.stream().limit(6).toList();
    }

    private Map<String, Object> indicators(List<Classroom> rooms, List<TimetableSlot> today,
                                           Map<String, Long> sectionCounts, LocalDateTime now, int alertCount) {
        List<TimetableSlot> active = today.stream().filter(slot -> contains(slot, now.toLocalTime())).toList();
        long occupiedRooms = active.stream().map(slot -> slot.getClassroom() == null ? null : slot.getClassroom().getId())
                .filter(Objects::nonNull).distinct().count();
        long scheduledStudents = active.stream().mapToLong(slot -> sectionCounts.getOrDefault(slot.getSection(), 0L)).sum();
        Double crowd = active.stream()
                .map(slot -> density(sectionCounts.getOrDefault(slot.getSection(), 0L),
                        slot.getClassroom() == null ? null : slot.getClassroom().getCapacity()))
                .filter(Objects::nonNull)
                .mapToDouble(value -> value)
                .average()
                .isPresent()
                ? round(active.stream()
                .map(slot -> density(sectionCounts.getOrDefault(slot.getSection(), 0L),
                        slot.getClassroom() == null ? null : slot.getClassroom().getCapacity()))
                .filter(Objects::nonNull)
                .mapToDouble(value -> value)
                .average()
                .orElse(0) * 100)
                : null;

        Map<String, Object> indicators = new LinkedHashMap<>();
        indicators.put("enrolledStudents", counted("Enrolled students", studentRepository.count(),
                "Account records. Not a live headcount on campus.", SourceClass.ESTIMATED));
        indicators.put("facultyAccounts", counted("Faculty accounts", userRepository.countByRole_RoleName(Role.UserRole.FACULTY),
                "Faculty user records.", SourceClass.ESTIMATED));
        indicators.put("activeClasses", counted("Active classes", active.size(),
                "Timetable slots covering the current clock time.", SourceClass.ESTIMATED));
        indicators.put("occupiedClassrooms", counted("Occupied classrooms", occupiedRooms,
                "Rooms with a slot in progress. Not an occupancy sensor.", SourceClass.ESTIMATED));
        indicators.put("availableClassrooms", counted("Available classrooms", Math.max(0, rooms.size() - occupiedRooms),
                "Stored rooms without a current slot.", SourceClass.ESTIMATED));
        indicators.put("crowdLevel", metric("Crowd level", crowd, "% of capacity",
                crowd == null ? "No class is scheduled at this hour." : "Average scheduled density of classes in progress.",
                SourceClass.ESTIMATED));
        indicators.put("energyDemand", metric("Energy demand", null, "kW",
                "No campus meter is connected. Open a building for the formula forecast.", SourceClass.SIMULATED));
        indicators.put("transportRoutes", counted("Transport routes", transportRouteRepository.count(),
                "Directory size. Not live vehicle status.", SourceClass.ESTIMATED));
        indicators.put("scheduledStudentsNow", counted("Students in scheduled classes", scheduledStudents,
                "Section sizes for classes in progress. Not gate entries.", SourceClass.ESTIMATED));
        indicators.put("activeAlerts", counted("Priority alerts", alertCount,
                "Rooms scheduled above 85% of capacity now or in the next 30 minutes.", SourceClass.ESTIMATED));
        return indicators;
    }

    private List<Map<String, Object>> health(Map<String, Object> indicators, List<Map<String, Object>> alerts) {
        List<Map<String, Object>> rows = new ArrayList<>();
        Double attendance = attendanceRepository.averageAttendancePercentage();
        long graded = marksRepository.countGradedMarks();
        Double pass = graded == 0 ? null : round(marksRepository.countPassingGrades() * 100.0 / graded);
        Double academics = attendance == null ? pass : Double.valueOf(round(attendance.doubleValue()));
        rows.add(score("Academics", academics, SourceClass.HISTORICAL,
                attendance == null ? "No attendance percentages are stored." : "Mean stored attendance percentage.",
                attendance == null ? List.of() : List.of("Mean attendance " + Math.round(attendance.doubleValue()) + "%"),
                pass == null ? List.of() : List.of("Pass share of graded marks " + Math.round(pass) + "%")));

        @SuppressWarnings("unchecked")
        Map<String, Object> occupied = (Map<String, Object>) indicators.get("occupiedClassrooms");
        @SuppressWarnings("unchecked")
        Map<String, Object> available = (Map<String, Object>) indicators.get("availableClassrooms");
        long occ = occupied.get("value") instanceof Number number ? number.longValue() : 0;
        long free = available.get("value") instanceof Number number ? number.longValue() : 0;
        long high = alerts.stream().filter(alert -> "HIGH".equals(alert.get("priority"))).count();
        Double infrastructure = (occ + free) == 0 ? null : round(100 - Math.min(100, high * 25.0));
        rows.add(score("Infrastructure", infrastructure, SourceClass.ESTIMATED,
                infrastructure == null ? "No classrooms are stored." : "Reduced when scheduled classes exceed room capacity.",
                List.of("Occupied rooms come from the timetable"),
                high == 0 ? List.of() : List.of(high + " room(s) scheduled above capacity")));

        rows.add(unscored("Energy", "No meter readings are stored. A formula forecast is not a health score."));
        rows.add(unscored("Transport", "The route directory is not a live fleet status."));
        rows.add(unscored("Safety", "No incident feed is connected."));
        rows.add(unscored("Student experience", "No experience survey is stored."));
        return rows;
    }

    private Map<String, Object> overall(List<Map<String, Object>> health) {
        List<Double> scores = health.stream()
                .map(row -> row.get("score"))
                .filter(Number.class::isInstance)
                .map(value -> ((Number) value).doubleValue())
                .toList();
        Map<String, Object> overall = new LinkedHashMap<>();
        overall.put("score", scores.isEmpty() ? null : round(scores.stream().mapToDouble(value -> value).average().orElse(0)));
        overall.put("scoredCategories", scores.size());
        overall.put("trend", null);
        overall.put("trendBecause", "No earlier campus score is stored, so trend is not shown.");
        overall.put("source", SourceClass.ESTIMATED.name());
        return overall;
    }

    private List<Map<String, Object>> timeline(List<TimetableSlot> today, List<TimetableSlot> tomorrow,
                                               List<Classroom> rooms, Map<String, Long> sectionCounts, LocalDateTime now) {
        LocalTime clock = now.toLocalTime();
        return List.of(
                horizon("Now", today, slot -> contains(slot, clock), sectionCounts),
                horizon("30 min", today, slot -> startsWithin(slot, clock, 30), sectionCounts),
                horizon("2 hours", today, slot -> startsWithin(slot, clock, 120), sectionCounts),
                horizon("Today", today, slot -> {
                    LocalTime start = parseTime(slot.getStartTime());
                    return start != null && !start.isBefore(clock);
                }, sectionCounts),
                horizon("Next day", tomorrow, slot -> true, sectionCounts)
        );
    }

    private Map<String, Object> horizon(String label, List<TimetableSlot> slots,
                                        java.util.function.Predicate<TimetableSlot> include,
                                        Map<String, Long> sectionCounts) {
        List<TimetableSlot> matched = slots.stream().filter(include).toList();
        var densities = matched.stream()
                .map(slot -> density(sectionCounts.getOrDefault(slot.getSection(), 0L),
                        slot.getClassroom() == null ? null : slot.getClassroom().getCapacity()))
                .filter(Objects::nonNull)
                .mapToDouble(value -> value);
        var average = densities.average();
        Double density = average.isPresent() ? round(average.getAsDouble() * 100) : null;
        long tight = matched.stream()
                .map(slot -> density(sectionCounts.getOrDefault(slot.getSection(), 0L),
                        slot.getClassroom() == null ? null : slot.getClassroom().getCapacity()))
                .filter(value -> value != null && value > 1)
                .count();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("classes", matched.size());
        row.put("crowdPercent", density);
        row.put("tightRooms", tight);
        row.put("energy", null);
        row.put("transport", null);
        row.put("source", SourceClass.ESTIMATED.name());
        row.put("because", "Timetable projection. Energy and transport are omitted because those feeds are not metered.");
        return row;
    }

    private Map<String, Object> models() {
        Map<String, Object> models = new LinkedHashMap<>();
        models.put("congestion", predictiveEngine.predictNextWeekTrends());
        models.put("energy", predictiveEngine.projectEnergyDemand());
        return models;
    }

    private static Map<String, Object> score(String name, Double value, SourceClass source, String because,
                                             List<String> contributors, List<String> negatives) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("name", name);
        row.put("score", value == null ? null : Math.max(0, Math.min(100, Math.round(value))));
        row.put("source", source.name());
        row.put("because", because);
        row.put("contributors", contributors);
        row.put("negatives", negatives);
        return row;
    }

    private static Map<String, Object> unscored(String name, String because) {
        return score(name, null, SourceClass.ESTIMATED, because, List.of(), List.of());
    }

    private static Map<String, Object> counted(String label, long value, String because, SourceClass source) {
        return metric(label, value, null, because, source);
    }

    private static Map<String, Object> metric(String label, Object value, String unit, String because, SourceClass source) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("value", value);
        row.put("unit", unit);
        row.put("source", source.name());
        row.put("because", because);
        return row;
    }

    private static Double energyKw(Building building, int classes) {
        return EnergyFormula.kw(building.getBaseEnergyLoad(), classes);
    }

    private static boolean sameRoom(TimetableSlot slot, Long roomId) {
        return slot.getClassroom() != null && roomId.equals(slot.getClassroom().getId());
    }

    private static boolean contains(TimetableSlot slot, LocalTime clock) {
        LocalTime start = parseTime(slot.getStartTime());
        LocalTime end = parseTime(slot.getEndTime());
        return start != null && end != null && !clock.isBefore(start) && clock.isBefore(end);
    }

    private static boolean startsWithin(TimetableSlot slot, LocalTime clock, int minutes) {
        LocalTime start = parseTime(slot.getStartTime());
        return start != null && !start.isBefore(clock) && !start.isAfter(clock.plusMinutes(minutes));
    }

    private static Double density(long students, Integer capacity) {
        if (capacity == null || capacity <= 0) {
            return null;
        }
        return students / (double) capacity;
    }

    static LocalTime parseTime(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String value = raw.trim();
        if (value.length() == 5) {
            value = value + ":00";
        }
        try {
            return LocalTime.parse(value.length() > 8 ? value.substring(0, 8) : value);
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static DayOfWeek nextTeachingDay(DayOfWeek day) {
        DayOfWeek next = day.plus(1);
        return next == DayOfWeek.SUNDAY ? DayOfWeek.MONDAY : next;
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
