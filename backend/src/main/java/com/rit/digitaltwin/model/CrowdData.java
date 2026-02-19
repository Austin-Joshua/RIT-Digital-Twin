package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "crowd_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrowdData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crowd_id")
    private Long crowdId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "occupancy_count", nullable = false)
    private int occupancyCount;

    @Column(name = "congestion_level")
    private String congestionLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "evacuation_time_est_min")
    private int evacuationTimeEstMin;

    @CreationTimestamp
    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt;
}
