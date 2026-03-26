package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "digital_twin_metrics", indexes = {
    @Index(name = "idx_metric_type", columnList = "metricType"),
    @Index(name = "idx_location_code", columnList = "locationCode"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class DigitalTwinMetrics extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String metricType; // CROWD_DENSITY, ENERGY_DEMAND, RESOURCE_UTIL

    private String locationCode; // Building or Classroom Code

    private Double value;

    private String unit;

    private LocalDateTime timestamp;

    private Boolean isSimulated;

    private String scenarioName; // Null for live data, contains scenario name for What-Ifs
}
