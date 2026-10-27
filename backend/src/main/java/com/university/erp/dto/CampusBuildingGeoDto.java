package com.university.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampusBuildingGeoDto {
    private Long id;
    private String name;
    private String code;
    private Integer totalCapacity;
    private BigDecimal baseEnergyLoad;
    private String location;

    // Geographic Coordinates & Footprint Geometry
    private Double latitude;
    private Double longitude;
    private Double localX;
    private Double localZ;
    private String footprintGeometry;
    private List<List<Double>> footprint;

    // Physical Dimension & Architectural Attribution
    private Double heightMeters;
    private Integer numberOfLevels;
    private String geometrySource;
    private String geometryStatus; // VERIFIED, APPROXIMATE, UNVERIFIED, INCOMPLETE, UNAVAILABLE
    private String heightSource;
    private String osmWayId;
    private String modelAssetUrl;
    private LocalDateTime sourceUpdatedAt;
    private LocalDateTime lastVerifiedAt;

    // Operational Digital Twin Context
    private Integer roomCount;
    private Integer activeClasses;
    private Integer availableRooms;
    private Long scheduledStudents;
    private Double energyKw;
    private String energySource;
    private String energyBecause;
    private Double crowdDensity;
    private List<String> departments;
}
