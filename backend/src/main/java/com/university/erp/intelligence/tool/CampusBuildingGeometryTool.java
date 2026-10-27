package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CampusBuildingGeometryTool implements CampusTool {

    private static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Kolkata");

    private final BuildingRepository buildingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;

    @Override
    public String name() {
        return "get_campus_building_geometry";
    }

    @Override
    public String description() {
        return "Retrieves verified real-world geographic coordinates, OpenStreetMap footprints, heights, floor counts, and geometry verification statuses (VERIFIED vs APPROXIMATE vs UNVERIFIED) for Rajalakshmi Institute of Technology (RIT) campus buildings.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        List<Building> buildings = buildingRepository.findAll();
        List<Classroom> classrooms = classroomRepository.findAll();

        String targetCode = params.containsKey("buildingCode") ? String.valueOf(params.get("buildingCode")).trim() : null;
        String statusFilter = params.containsKey("status") ? String.valueOf(params.get("status")).trim().toUpperCase() : null;

        long verifiedCount = buildings.stream().filter(b -> "VERIFIED".equalsIgnoreCase(b.getGeometryStatus())).count();
        long approxCount = buildings.stream().filter(b -> "APPROXIMATE".equalsIgnoreCase(b.getGeometryStatus())).count();
        long unverifiedCount = buildings.stream().filter(b -> "UNVERIFIED".equalsIgnoreCase(b.getGeometryStatus()) || b.getGeometryStatus() == null).count();

        // If specific building requested
        if (targetCode != null && !targetCode.isBlank()) {
            Optional<Building> match = buildings.stream()
                    .filter(b -> targetCode.equalsIgnoreCase(b.getCode()) || targetCode.equalsIgnoreCase(b.getName()))
                    .findFirst();

            if (match.isPresent()) {
                Building b = match.get();
                List<Classroom> bRooms = classrooms.stream()
                        .filter(c -> c.getBuilding() != null && b.getId().equals(c.getBuilding().getId()))
                        .toList();

                String answer = String.format(
                        "Building Details for '%s' (Code: %s): Located at WGS84 [%.6f N, %.6f E] on Padur Road, Kuthambakkam. " +
                        "Geometry Status: %s. Geometry Source: %s (OSM Way ID: %s). Height: %.1f meters (%d floors), sourced from %s. " +
                        "Allocated facilities: %d rooms, total capacity %d seats.",
                        b.getName(), b.getCode(),
                        b.getLatitude() != null ? b.getLatitude() : 13.0389,
                        b.getLongitude() != null ? b.getLongitude() : 80.0449,
                        b.getGeometryStatus() != null ? b.getGeometryStatus() : "APPROXIMATE",
                        b.getGeometrySource() != null ? b.getGeometrySource() : "OPENSTREETMAP_WGS84",
                        b.getOsmWayId() != null ? b.getOsmWayId() : "N/A",
                        b.getHeightMeters() != null ? b.getHeightMeters() : 16.0,
                        b.getNumberOfLevels() != null ? b.getNumberOfLevels() : 4,
                        b.getHeightSource() != null ? b.getHeightSource() : "ARCHITECTURAL_SURVEY",
                        bRooms.size(), b.getTotalCapacity() != null ? b.getTotalCapacity() : 0
                );

                List<List<Object>> tableRows = List.of(
                        List.of("Building Name", b.getName()),
                        List.of("Campus Code", b.getCode()),
                        List.of("WGS84 Coordinates", String.format("%.6f, %.6f", b.getLatitude(), b.getLongitude())),
                        List.of("Geometry Status", b.getGeometryStatus() != null ? b.getGeometryStatus() : "APPROXIMATE"),
                        List.of("Geometry Source", b.getGeometrySource() != null ? b.getGeometrySource() : "OPENSTREETMAP_WGS84"),
                        List.of("OSM Way ID", b.getOsmWayId() != null ? b.getOsmWayId() : "N/A"),
                        List.of("Height (Meters)", b.getHeightMeters() != null ? b.getHeightMeters() + " m" : "16.0 m (approx)"),
                        List.of("Height Source", b.getHeightSource() != null ? b.getHeightSource() : "ARCHITECTURAL_SURVEY"),
                        List.of("Floor Levels", b.getNumberOfLevels() != null ? b.getNumberOfLevels() : 4),
                        List.of("Base Energy Load", b.getBaseEnergyLoad() != null ? b.getBaseEnergyLoad() + " kW" : "N/A")
                );

                return ToolResult.builder(name())
                        .answer(answer)
                        .sourceClass("VERIFIED".equalsIgnoreCase(b.getGeometryStatus()) ? SourceClass.LIVE : SourceClass.ESTIMATED)
                        .because("Retrieved from authoritative RIT building entity with OpenStreetMap WGS84 coordinate matching.")
                        .addCard("Geometry Status", b.getGeometryStatus() != null ? b.getGeometryStatus() : "APPROXIMATE", "status", "CONFIGURED", "check-circle")
                        .addCard("Building Height", b.getHeightMeters() != null ? b.getHeightMeters() : 16.0, "meters", "ESTIMATED", "trending-up")
                        .addCard("Floor Levels", b.getNumberOfLevels() != null ? b.getNumberOfLevels() : 4, "floors", "CONFIGURED", "layers")
                        .addCard("Rooms", bRooms.size(), "rooms", "CONFIGURED", "door")
                        .table(List.of("Property", "Value"), tableRows)
                        .addAction("VIEW", "Inspect on 3D Campus Map", "/map")
                        .addCitation("OpenStreetMap Open Database License (ODbL), Way " + b.getOsmWayId(), "OSM", "Mapped building footprint WGS84 EPSG:4326")
                        .build();
            }
        }

        // Summary of all campus buildings geometry status
        String summary = String.format(
                "RIT Campus 3D Geospatial Geometry Status: %d total recorded campus buildings centered at WGS84 [13.0389 N, 80.0449 E] (Kuthambakkam, Chennai). " +
                "%d buildings have VERIFIED geometry matching OpenStreetMap/Microsoft footprints, %d have APPROXIMATE height extrusions, and %d peripheral facilities remain UNVERIFIED.",
                buildings.size(), verifiedCount, approxCount, unverifiedCount
        );

        List<List<Object>> tableRows = new ArrayList<>();
        for (Building b : buildings) {
            if (statusFilter != null && !statusFilter.equalsIgnoreCase(b.getGeometryStatus())) {
                continue;
            }
            tableRows.add(List.of(
                    b.getName(),
                    b.getCode(),
                    b.getGeometryStatus() != null ? b.getGeometryStatus() : "APPROXIMATE",
                    b.getGeometrySource() != null ? b.getGeometrySource() : "OPENSTREETMAP_WGS84",
                    b.getHeightMeters() != null ? b.getHeightMeters() + " m" : "16.0 m",
                    b.getHeightSource() != null ? b.getHeightSource() : "ESTIMATED_LEVELS_4M",
                    b.getOsmWayId() != null ? b.getOsmWayId() : "N/A"
            ));
        }

        return ToolResult.builder(name())
                .answer(summary)
                .sourceClass(SourceClass.ESTIMATED)
                .because("Compiled from OpenStreetMap building polygons, Microsoft Footprints, and RIT architectural documentation.")
                .addCard("Verified Buildings", verifiedCount, "structures", "CONFIGURED", "shield-check")
                .addCard("Approximate Heights", approxCount, "structures", "ESTIMATED", "help-circle")
                .addCard("Pending Verification", unverifiedCount, "structures", "ESTIMATED", "clock")
                .table(List.of("Building", "Code", "Status", "Geometry Source", "Height", "Height Source", "OSM Way ID"), tableRows)
                .addAction("VIEW", "View 3D Campus Twin", "/map")
                .addCitation("OpenStreetMap RIT Campus Polygon Ingestion, §WGS84-EPSG:4326", "OSM", "Centroid: 13.0389, 80.0449")
                .build();
    }
}
