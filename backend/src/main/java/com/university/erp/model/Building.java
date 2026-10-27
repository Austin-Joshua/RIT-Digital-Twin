package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "buildings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Building extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code; // e.g., MAIN, LAB, HOSTEL_A

    private Integer totalCapacity;

    @Column(name = "base_energy_load", precision = 10, scale = 2)
    private BigDecimal baseEnergyLoad; // kW per hour baseline

    private String location; // Lat, Long or simple description

    // Real-world Geospatial & Digital Twin 3D Geometry Attributes
    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String footprintGeometry; // JSON array of [x, z] or [[lon, lat], ...] polygon coordinates

    private Double heightMeters;
    private Integer numberOfLevels;

    @Column(name = "geometry_source")
    private String geometrySource; // e.g. OPENSTREETMAP_WGS84, MICROSOFT_BUILDING_FOOTPRINTS_OSM

    @Column(name = "geometry_status")
    private String geometryStatus; // VERIFIED, APPROXIMATE, UNVERIFIED, INCOMPLETE, UNAVAILABLE

    @Column(name = "height_source")
    private String heightSource; // ARCHITECTURAL_SURVEY, ESTIMATED_LEVELS_4M, etc.

    @Column(name = "osm_way_id")
    private String osmWayId; // e.g. 367941212

    @Column(name = "model_asset_url")
    private String modelAssetUrl;

    @Column(name = "source_updated_at")
    private java.time.LocalDateTime sourceUpdatedAt;

    @Column(name = "last_verified_at")
    private java.time.LocalDateTime lastVerifiedAt;
}
