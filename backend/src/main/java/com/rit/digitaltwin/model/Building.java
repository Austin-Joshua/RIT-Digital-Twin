package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "buildings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Building {

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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Alias for getName to satisfy AllocationEngine
    public String getName() {
        return buildingName;
    }
}
