package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sustainability_metrics", indexes = {
        @Index(name = "idx_sustainability_period", columnList = "period_label"),
        @Index(name = "idx_sustainability_date", columnList = "recorded_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SustainabilityMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_label", nullable = false, length = 50)
    private String periodLabel; // e.g., "2025-Q1", "2025-Sem1"

    @Column(name = "energy_score", nullable = false)
    private Double energyScore;

    @Column(name = "transport_score", nullable = false)
    private Double transportScore;

    @Column(name = "infrastructure_score", nullable = false)
    private Double infrastructureScore;

    @Column(name = "carbon_score")
    private Double carbonScore;

    @Column(name = "composite_index", nullable = false)
    private Double compositeIndex;

    @Column(name = "sdg_alignment_score")
    private Double sdgAlignmentScore;

    @Column(name = "energy_kwh_saved")
    private Double energyKwhSaved;

    @Column(name = "co2_reduced_kg")
    private Double co2ReducedKg;

    @Column(name = "solar_contribution_pct")
    private Double solarContributionPct;

    @Column(name = "recorded_date", nullable = false)
    private LocalDateTime recordedDate;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
