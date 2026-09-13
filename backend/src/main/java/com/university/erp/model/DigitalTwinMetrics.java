package com.university.erp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.university.erp.intelligence.SourceClass;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "digital_twin_metrics", indexes = {
    @Index(name = "idx_metric_type", columnList = "metric_type"),
    @Index(name = "idx_location_code", columnList = "location_code"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_dtm_type_time", columnList = "metric_type, timestamp")
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

    @Enumerated(EnumType.STRING)
    @Column(name = "source_class", length = 16)
    private SourceClass sourceClass;

    private String scenarioName; // Null for live data, contains scenario name for What-Ifs

    @JsonProperty("source")
    public String getSource() {
        return sourceClass == null ? null : sourceClass.name();
    }
}
