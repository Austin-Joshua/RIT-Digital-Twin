package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "crowd_data", indexes = {
        @Index(name = "idx_crowd_zone", columnList = "zone_name"),
        @Index(name = "idx_crowd_timestamp", columnList = "recorded_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrowdData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zone_name", nullable = false, length = 100)
    private String zoneName;

    @Column(name = "zone_capacity", nullable = false)
    private Integer zoneCapacity;

    @Column(name = "current_count", nullable = false)
    private Integer currentCount;

    @Column(name = "density_level", length = 20)
    private String densityLevel; // LOW, MODERATE, HIGH, CRITICAL

    @Column(name = "is_emergency")
    @Builder.Default
    private Boolean isEmergency = false;

    @Column(name = "exit_count")
    private Integer exitCount;

    @Column(name = "avg_flow_rate")
    private Double avgFlowRate;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
