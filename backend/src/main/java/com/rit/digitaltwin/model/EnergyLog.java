package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "energy_logs", indexes = {
        @Index(name = "idx_el_building", columnList = "building_id"),
        @Index(name = "idx_el_date", columnList = "reading_date"),
        @Index(name = "idx_el_building_date", columnList = "building_id, reading_date"),
        @Index(name = "idx_el_source", columnList = "source")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnergyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @Column(name = "reading_hour", nullable = false)
    private Integer readingHour;

    @Column(name = "consumption_kwh", nullable = false, precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal consumptionKwh = BigDecimal.ZERO;

    @Column(name = "solar_generation_kwh", nullable = false, precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal solarGenerationKwh = BigDecimal.ZERO;

    @Column(name = "peak_demand_kw", precision = 10, scale = 4)
    private BigDecimal peakDemandKw;

    @Column(name = "temperature_c", precision = 5, scale = 2)
    private BigDecimal temperatureC;

    @Column(name = "hvac_usage_kwh", precision = 10, scale = 4)
    private BigDecimal hvacUsageKwh;

    @Column(name = "lighting_kwh", precision = 10, scale = 4)
    private BigDecimal lightingKwh;

    @Column(name = "equipment_kwh", precision = 10, scale = 4)
    private BigDecimal equipmentKwh;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EnergySource source = EnergySource.SENSOR;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
