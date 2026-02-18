package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "buildings", indexes = {
        @Index(name = "idx_building_type", columnList = "building_type"),
        @Index(name = "idx_building_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "total_floors", nullable = false)
    @Builder.Default
    private Integer totalFloors = 1;

    @Column(name = "total_area_sqft")
    private BigDecimal totalAreaSqft;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "year_built")
    private Integer yearBuilt;

    @Enumerated(EnumType.STRING)
    @Column(name = "building_type", nullable = false)
    @Builder.Default
    private BuildingType buildingType = BuildingType.ACADEMIC;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
