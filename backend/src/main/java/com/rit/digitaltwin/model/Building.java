package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "buildings")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Building extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "building_id")
    private Long buildingId;

    @Column(name = "building_name", nullable = false, unique = true)
    private String buildingName;

    @Column(name = "building_code")
    private String code;

    @Column(name = "total_floors", nullable = false)
    private int totalFloors;

    @Column(name = "total_capacity")
    private int totalCapacity;

    @Column(name = "location_coordinates")
    private String locationCoordinates;

    // Alias for getName to satisfy AllocationEngine
    public String getName() {
        return buildingName;
    }
}
