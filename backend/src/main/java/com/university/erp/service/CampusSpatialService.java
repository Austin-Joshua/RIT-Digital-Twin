package com.university.erp.service;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.AssetInventory;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.AssetInventoryRepository;
import com.university.erp.repository.AttendanceRiskRepository;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.CampusRecordQuery;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CampusSpatialService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");

    private final BuildingRepository buildingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final CampusRecordQuery campusRecordQuery;
    private final AttendanceRiskRepository attendanceRiskRepository;
    private final AssetInventoryRepository assetInventoryRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> index(String horizon) {
        String selected = normalizeHorizon(horizon);
        boolean operational = operationalRole();
        boolean sensitive = sensitiveRole();
        LocalDateTime now = LocalDateTime.now(CAMPUS);
        List<Building> buildings = buildingRepository.findAll();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("asOf", now.toString());
        body.put("timezone", CAMPUS.getId());
        body.put("horizon", selected);
        body.put("hierarchy", List.of("Campus", "Building", "Floor", "Room", "Asset"));
        body.put("floorBecause", "No floor records are stored. Rooms stay under the building and are loaded only when that building is opened.");
        body.put("operational", operational);
        body.put("source", SourceClass.ESTIMATED.name());
        body.put("because", operational
                ? "Spatial index of stored buildings. Rooms and assets are not included until opened."
                : "Campus names only. Scheduled occupancy, energy, and student records are not included for this role.");

        if (!operational) {
            body.put("buildings", buildings.stream().map(this::nameOnly).toList());
            body.put("layers", lockedLayers());
            body.put("horizons", horizonNotes(0));
            return body;
        }

        Map<String, Long> sections = sectionCounts();
        List<TimetableSlot> today = timetableSlotRepository.findByDayOfWeekIgnoreCase(now.getDayOfWeek().name());
        List<Classroom> rooms = classroomRepository.findAllWithBuilding();
        Map<String, Long> riskBySection = sensitive ? highRiskBySection() : Map.of();
        List<AssetInventory> assets = sensitive ? assetInventoryRepository.findAll() : List.of();
        Map<String, DigitalTwinMetrics> past = "PAST".equals(selected) ? latestSamples(now) : Map.of();

        List<Map<String, Object>> rows = new ArrayList<>();
        int linkedMaintenance = 0;
        for (Building building : buildings) {
            List<Classroom> here = rooms.stream()
                    .filter(room -> room.getBuilding() != null && building.getId().equals(room.getBuilding().getId()))
                    .toList();
            Map<String, Object> row = buildingRow(building, here, today, sections, riskBySection, assets, past, selected, now, sensitive);
            linkedMaintenance += row.get("maintenanceMatches") instanceof Number number ? number.intValue() : 0;
            rows.add(row);
        }
        rows.sort((left, right) -> String.valueOf(left.get("name")).compareTo(String.valueOf(right.get("name"))));

        body.put("buildings", rows);
        body.put("layers", layers(sensitive, !riskBySection.isEmpty(), linkedMaintenance > 0, past.size()));
        body.put("horizons", horizonNotes(past.size()));
        return body;
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> building(Long id, String horizon) {
        if (!operationalRole() || id == null) {
            return Optional.empty();
        }
        return buildingRepository.findById(id).map(building -> buildingDetail(building, normalizeHorizon(horizon)));
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> room(Long id, String horizon) {
        if (!operationalRole() || id == null) {
            return Optional.empty();
        }
        return classroomRepository.findById(id).map(room -> roomDetail(room, normalizeHorizon(horizon)));
    }

    private Map<String, Object> buildingDetail(Building building, String horizon) {
        LocalDateTime now = LocalDateTime.now(CAMPUS);
        List<Classroom> rooms = classroomRepository.findByBuilding_Id(building.getId());
        List<TimetableSlot> today = timetableSlotRepository.findByDayOfWeekIgnoreCase(now.getDayOfWeek().name());
        Map<String, Long> sections = sectionCounts();
        boolean sensitive = sensitiveRole();
        Map<String, Long> risk = sensitive ? highRiskBySection() : Map.of();
        List<AssetInventory> assets = sensitive ? assetInventoryRepository.findAll() : List.of();
        Map<String, DigitalTwinMetrics> past = "PAST".equals(horizon) ? latestSamples(now) : Map.of();

        Map<String, Object> row = buildingRow(building, rooms, today, sections, risk, assets, past, horizon, now, sensitive);
        List<Map<String, Object>> roomRows = new ArrayList<>();
        for (Classroom room : rooms) {
            roomRows.add(roomSummary(room, today, sections, past, horizon, now));
        }
        roomRows.sort((left, right) -> String.valueOf(left.get("name")).compareTo(String.valueOf(right.get("name"))));
        row.put("rooms", roomRows);
        row.put("floors", Map.of(
                "recorded", false,
                "visualOnly", true,
                "because", "No floor records are stored. The 3D floor count is part of the visual model, not an occupancy split."));
        row.put("assetsLoaded", false);
        row.put("assetsBecause", sensitive
                ? "Assets are loaded when a room is opened, and only if the asset location text matches that room."
                : "Asset records are limited to admin and HOD.");
        return row;
    }

    private Map<String, Object> roomDetail(Classroom room, String horizon) {
        LocalDateTime now = LocalDateTime.now(CAMPUS);
        List<TimetableSlot> today = timetableSlotRepository.findByDayOfWeekIgnoreCase(now.getDayOfWeek().name());
        Map<String, Long> sections = sectionCounts();
        Map<String, DigitalTwinMetrics> past = "PAST".equals(horizon) ? latestSamples(now) : Map.of();
        Map<String, Object> row = roomSummary(room, today, sections, past, horizon, now);
        row.put("capacity", room.getCapacity());
        row.put("type", room.getType());
        row.put("buildingId", room.getBuilding() == null ? null : room.getBuilding().getId());
        row.put("buildingName", room.getBuilding() == null ? null : room.getBuilding().getName());
        boolean sensitive = sensitiveRole();
        if (!sensitive) {
            row.put("assets", List.of());
            row.put("assetsBecause", "Asset records are limited to admin and HOD.");
            return row;
        }
        String roomName = room.getName();
        List<Map<String, Object>> assets = new ArrayList<>();
        for (AssetInventory asset : assetInventoryRepository.findAll()) {
            if (assets.size() >= 20) {
                break;
            }
            if (!locationMatches(asset.getLocation(), roomName)) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", asset.getId());
            item.put("name", asset.getAssetName());
            item.put("category", asset.getCategory());
            item.put("status", asset.getStatus());
            item.put("lastMaintained", asset.getLastMaintained());
            item.put("location", asset.getLocation());
            item.put("source", SourceClass.ESTIMATED.name());
            item.put("because", "Matched by location text. The asset is not assigned to this room by a record link.");
            assets.add(item);
        }
        row.put("assets", assets);
        row.put("assetsBecause", assets.isEmpty()
                ? "No asset location text matches this room."
                : "Text match only. Not a placed asset.");
        return row;
    }

    private Map<String, Object> buildingRow(Building building, List<Classroom> rooms, List<TimetableSlot> today,
                                            Map<String, Long> sections, Map<String, Long> riskBySection,
                                            List<AssetInventory> assets, Map<String, DigitalTwinMetrics> past,
                                            String horizon, LocalDateTime now, boolean sensitive) {
        List<TimetableSlot> relevant = new ArrayList<>();
        long students = 0;
        long risk = 0;
        List<Double> densities = new ArrayList<>();
        for (Classroom room : rooms) {
            TimetableSlot slot = slotFor(today, room.getId(), horizon, now);
            if (slot == null) {
                continue;
            }
            relevant.add(slot);
            long count = sections.getOrDefault(slot.getSection(), 0L);
            students += count;
            risk += riskBySection.getOrDefault(slot.getSection(), 0L);
            Double density = density(count, room.getCapacity());
            if (density != null) {
                densities.add(density);
            }
        }
        Double peak = densities.stream().max((left, right) -> Double.compare(left, right)).orElse(null);
        if ("PAST".equals(horizon)) {
            peak = pastDensity(building, rooms, past);
        }
        int maintenance = 0;
        if (sensitive) {
            for (AssetInventory asset : assets) {
                if (locationMatches(asset.getLocation(), building.getName(), building.getCode())) {
                    maintenance += 1;
                }
            }
        }
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", building.getId());
        row.put("name", building.getName());
        row.put("code", building.getCode());
        row.put("roomCount", rooms.size());
        row.put("activeClasses", relevant.size());
        row.put("availableRooms", Math.max(0, rooms.size() - relevant.size()));
        row.put("scheduledStudents", "PAST".equals(horizon) ? null : students);
        row.put("crowd", peak == null ? null : round(peak * 100));
        row.put("utilization", rooms.isEmpty() || "PAST".equals(horizon) ? null : round(relevant.size() * 100.0 / rooms.size()));
        row.put("energyKw", energyKw(building, relevant.size()));
        row.put("energySource", row.get("energyKw") == null ? null : SourceClass.SIMULATED.name());
        row.put("energyBecause", row.get("energyKw") == null
                ? EnergyFormula.UNAVAILABLE
                : EnergyFormula.BECAUSE);
        if ("PAST".equals(horizon)) {
            DigitalTwinMetrics energy = past.get("ENERGY_DEMAND:" + building.getCode());
            if (energy != null && energy.getValue() != null) {
                row.put("energyKw", round(energy.getValue()));
                row.put("energySource", SourceClass.HISTORICAL.name());
                row.put("energyBecause", "Stored energy sample for this building code. Not a live meter.");
            } else {
                row.put("energyKw", null);
                row.put("energySource", null);
                row.put("energyBecause", "No stored energy sample for this building.");
            }
        }
        row.put("alertCount", densities.stream().filter(value -> value >= 0.85).count());
        row.put("attendanceRiskCount", sensitive && !"PAST".equals(horizon) ? risk : null);
        row.put("maintenanceMatches", sensitive ? maintenance : null);
        row.put("maintenanceBecause", sensitive
                ? (maintenance == 0 ? "No asset location text matches this building." : "Matched by location text. Not a work-order system.")
                : "Asset records are limited to admin and HOD.");
        row.put("prediction", prediction(today, rooms, sections, now));
        row.put("pastSample", "PAST".equals(horizon) && peak != null);
        row.put("source", "PAST".equals(horizon) ? SourceClass.HISTORICAL.name() : SourceClass.ESTIMATED.name());
        row.put("because", horizonBecause(horizon));
        return row;
    }

    private Map<String, Object> roomSummary(Classroom room, List<TimetableSlot> today, Map<String, Long> sections,
                                            Map<String, DigitalTwinMetrics> past, String horizon, LocalDateTime now) {
        TimetableSlot current = "PAST".equals(horizon) ? null : slotFor(today, room.getId(), horizon, now);
        TimetableSlot next = "PAST".equals(horizon) ? null : nextSlot(today, room.getId(), now.toLocalTime());
        long students = current == null ? 0 : sections.getOrDefault(current.getSection(), 0L);
        Double density = current == null ? null : density(students, room.getCapacity());
        DigitalTwinMetrics sample = past.get("CROWD_DENSITY:" + room.getName());
        if ("PAST".equals(horizon) && sample != null && sample.getValue() != null) {
            density = sample.getValue();
        }
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", room.getId());
        row.put("name", room.getName());
        row.put("capacity", room.getCapacity());
        row.put("occupancy", "PAST".equals(horizon) ? null : (current == null ? 0 : students));
        row.put("currentClass", current == null || current.getSubject() == null ? null : current.getSubject().getSubjectName());
        row.put("section", current == null ? null : current.getSection());
        row.put("nextClass", next == null || next.getSubject() == null ? null : next.getSubject().getSubjectName());
        row.put("nextStart", next == null ? null : next.getStartTime());
        row.put("utilization", density == null ? null : round(density * 100));
        row.put("available", "PAST".equals(horizon) ? null : current == null);
        row.put("alert", density != null && density >= 0.85);
        row.put("source", "PAST".equals(horizon) ? SourceClass.HISTORICAL.name() : SourceClass.ESTIMATED.name());
        row.put("because", "PAST".equals(horizon)
                ? (sample == null ? "No stored density sample for this room." : "Stored density sample. The class in session was not saved with it.")
                : "Section size against room capacity. Not a people counter.");
        return row;
    }

    private Map<String, Object> prediction(List<TimetableSlot> today, List<Classroom> rooms,
                                           Map<String, Long> sections, LocalDateTime now) {
        LocalTime limit = now.toLocalTime().plusMinutes(30);
        long classes = 0;
        List<Double> densities = new ArrayList<>();
        for (TimetableSlot slot : today) {
            if (slot.getClassroom() == null || rooms.stream().noneMatch(room -> room.getId().equals(slot.getClassroom().getId()))) {
                continue;
            }
            LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
            if (start == null || start.isBefore(now.toLocalTime()) || start.isAfter(limit)) {
                continue;
            }
            classes += 1;
            Double density = density(sections.getOrDefault(slot.getSection(), 0L), slot.getClassroom().getCapacity());
            if (density != null) {
                densities.add(density);
            }
        }
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("classes", classes);
        row.put("crowdPercent", densities.isEmpty() ? null : round(densities.stream().mapToDouble(value -> value).average().orElse(0) * 100));
        row.put("source", SourceClass.ESTIMATED.name());
        row.put("because", "Classes in this building starting within 30 minutes. Not a sensor forecast.");
        return row;
    }

    private TimetableSlot slotFor(List<TimetableSlot> today, Long roomId, String horizon, LocalDateTime now) {
        if ("PAST".equals(horizon)) {
            return null;
        }
        if ("PREDICTED".equals(horizon)) {
            LocalTime limit = now.toLocalTime().plusHours(2);
            return today.stream()
                    .filter(slot -> sameRoom(slot, roomId))
                    .filter(slot -> {
                        LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
                        return start != null && !start.isBefore(now.toLocalTime()) && !start.isAfter(limit);
                    })
                    .min((left, right) -> String.valueOf(left.getStartTime()).compareTo(String.valueOf(right.getStartTime())))
                    .orElse(null);
        }
        return today.stream().filter(slot -> sameRoom(slot, roomId) && contains(slot, now.toLocalTime())).findFirst().orElse(null);
    }

    private TimetableSlot nextSlot(List<TimetableSlot> today, Long roomId, LocalTime clock) {
        return today.stream()
                .filter(slot -> sameRoom(slot, roomId))
                .filter(slot -> {
                    LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
                    return start != null && start.isAfter(clock);
                })
                .min((left, right) -> String.valueOf(left.getStartTime()).compareTo(String.valueOf(right.getStartTime())))
                .orElse(null);
    }

    private Double pastDensity(Building building, List<Classroom> rooms, Map<String, DigitalTwinMetrics> past) {
        DigitalTwinMetrics buildingSample = past.get("CROWD_DENSITY:" + building.getCode());
        if (buildingSample != null && buildingSample.getValue() != null) {
            return buildingSample.getValue() > 1 ? buildingSample.getValue() / 100.0 : buildingSample.getValue();
        }
        List<Double> samples = new ArrayList<>();
        for (Classroom room : rooms) {
            DigitalTwinMetrics sample = past.get("CROWD_DENSITY:" + room.getName());
            if (sample != null && sample.getValue() != null) {
                samples.add(sample.getValue() > 1 ? sample.getValue() / 100.0 : sample.getValue());
            }
        }
        return samples.isEmpty() ? null : samples.stream().mapToDouble(value -> value).average().orElse(0);
    }

    private Map<String, DigitalTwinMetrics> latestSamples(LocalDateTime now) {
        Map<String, DigitalTwinMetrics> latest = new HashMap<>();
        List<DigitalTwinMetrics> samples = campusRecordQuery.historicalSamples(
                List.of("CROWD_DENSITY", "ENERGY_DEMAND"), now, PageRequest.of(0, 200));
        for (DigitalTwinMetrics sample : samples) {
            if (sample.getLocationCode() == null) {
                continue;
            }
            latest.putIfAbsent(sample.getMetricType() + ":" + sample.getLocationCode(), sample);
        }
        return latest;
    }

    private Map<String, Long> highRiskBySection() {
        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : attendanceRiskRepository.countHighRiskBySection()) {
            if (row[0] != null && row[1] instanceof Number number) {
                counts.put(String.valueOf(row[0]), number.longValue());
            }
        }
        return counts;
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

    private List<Map<String, Object>> layers(boolean sensitive, boolean riskRows, boolean maintenanceLinked, int pastSamples) {
        List<Map<String, Object>> layers = new ArrayList<>();
        layers.add(layer("crowd", true, SourceClass.ESTIMATED, "Scheduled density for the selected time. Colored only when a campus record is linked to the model."));
        layers.add(layer("energy", true, SourceClass.SIMULATED, "Formula from stored base load. Unmetered buildings stay uncolored."));
        layers.add(layer("utilization", true, SourceClass.ESTIMATED, "Rooms with a timetable slot in this window, divided by stored rooms."));
        layers.add(layer("attendance", sensitive && riskRows, SourceClass.ESTIMATED, !sensitive
                ? "Attendance risk counts are limited to admin and HOD."
                : riskRows
                    ? "High-risk students whose section is scheduled in this window. Not a room sensor."
                    : "No high attendance-risk rows are stored, so the layer stays off."));
        layers.add(layer("transport", false, SourceClass.ESTIMATED, "Routes have no map coordinates."));
        layers.add(layer("safety", false, SourceClass.ESTIMATED, "No incident locations are stored."));
        layers.add(layer("maintenance", sensitive && maintenanceLinked, SourceClass.ESTIMATED, !sensitive
                ? "Asset records are limited to admin and HOD."
                : maintenanceLinked
                    ? "Asset location text matched a building name or code. Not a placed marker."
                    : "Assets are not assigned to buildings, so the layer stays off."));
        if (pastSamples == 0) {
            layers.add(layer("past-note", false, SourceClass.HISTORICAL, "Past view reads stored samples. None are stored yet, so the model will not recolor."));
        }
        return layers;
    }

    private List<Map<String, Object>> lockedLayers() {
        return List.of(
                layer("crowd", false, SourceClass.ESTIMATED, "Scheduled occupancy is not shown for this role."),
                layer("energy", false, SourceClass.SIMULATED, "Energy formulas are not shown for this role."),
                layer("utilization", false, SourceClass.ESTIMATED, "Room utilization is not shown for this role."),
                layer("attendance", false, SourceClass.ESTIMATED, "Attendance risk is not shown for this role."),
                layer("transport", false, SourceClass.ESTIMATED, "Routes have no map coordinates."),
                layer("safety", false, SourceClass.ESTIMATED, "No incident locations are stored."),
                layer("maintenance", false, SourceClass.ESTIMATED, "Asset records are not shown for this role.")
        );
    }

    private List<Map<String, Object>> horizonNotes(int pastSamples) {
        return List.of(
                horizonNote("PAST", true, pastSamples == 0
                        ? "No stored spatial samples yet. The model stays in its visual state."
                        : "Latest stored density sample. This is not a class replay."),
                horizonNote("NOW", true, "Timetable state at the campus clock."),
                horizonNote("PREDICTED", true, "Next scheduled class within 2 hours. No sensor forecast.")
        );
    }

    private Map<String, Object> nameOnly(Building building) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", building.getId());
        row.put("name", building.getName());
        row.put("code", building.getCode());
        row.put("source", SourceClass.ESTIMATED.name());
        return row;
    }

    private static Map<String, Object> layer(String id, boolean enabled, SourceClass source, String because) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("label", id);
        row.put("enabled", enabled);
        row.put("source", source.name());
        row.put("because", because);
        return row;
    }

    private static Map<String, Object> horizonNote(String id, boolean available, String because) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("available", available);
        row.put("because", because);
        return row;
    }

    private static String horizonBecause(String horizon) {
        if ("PAST".equals(horizon)) {
            return "Stored metric sample. Missing rooms are not backfilled.";
        }
        if ("PREDICTED".equals(horizon)) {
            return "Next timetable slot within 2 hours. Not a measured forecast.";
        }
        return "Scheduled class covering the current clock. Not a live headcount.";
    }

    private static Double energyKw(Building building, int classes) {
        return EnergyFormula.kw(building.getBaseEnergyLoad(), classes);
    }

    private static boolean locationMatches(String location, String... tokens) {
        if (location == null || location.isBlank()) {
            return false;
        }
        String hay = location.toLowerCase();
        for (String token : tokens) {
            if (token != null && token.trim().length() >= 4 && hay.contains(token.trim().toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    private static boolean sameRoom(TimetableSlot slot, Long roomId) {
        return slot.getClassroom() != null && roomId.equals(slot.getClassroom().getId());
    }

    private static boolean contains(TimetableSlot slot, LocalTime clock) {
        LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
        LocalTime end = CampusCommandService.parseTime(slot.getEndTime());
        return start != null && end != null && !clock.isBefore(start) && clock.isBefore(end);
    }

    private static Double density(long students, Integer capacity) {
        if (capacity == null || capacity <= 0) {
            return null;
        }
        return students / (double) capacity;
    }

    private static String normalizeHorizon(String horizon) {
        String value = horizon == null ? "NOW" : horizon.trim().toUpperCase();
        return switch (value) {
            case "PAST", "PREDICTED" -> value;
            default -> "NOW";
        };
    }

    private static boolean operationalRole() {
        return hasRole("ADMIN") || hasRole("HOD") || hasRole("FACULTY");
    }

    private static boolean sensitiveRole() {
        return hasRole("ADMIN") || hasRole("HOD");
    }

    private static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String expected = "ROLE_" + role;
        return auth.getAuthorities().stream().anyMatch(authority -> expected.equals(authority.getAuthority()));
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
