package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "energy_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnergyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "energy_usage_kwh", nullable = false)
    private Double energyUsageKwh;

    @Column(name = "solar_generated_kwh")
    private Double solarGeneratedKwh;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp;
}
