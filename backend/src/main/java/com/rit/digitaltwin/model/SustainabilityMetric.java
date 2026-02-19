package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sustainability_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SustainabilityMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "metric_id")
    private Long metricId;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(name = "energy_score")
    private Double energyScore;

    @Column(name = "transport_score")
    private Double transportScore;

    @Column(name = "waste_management_score")
    private Double wasteManagementScore;

    @Column(name = "composite_index")
    private Double compositeIndex;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
