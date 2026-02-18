package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_results", indexes = {
        @Index(name = "idx_sr_type", columnList = "simulation_type"),
        @Index(name = "idx_sr_status", columnList = "status"),
        @Index(name = "idx_sr_user", columnList = "run_by_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "simulation_type", nullable = false)
    private SimulationType simulationType;

    @Column(name = "simulation_name", nullable = false, length = 150)
    private String simulationName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_by_user_id")
    private User runByUser;

    @Column(columnDefinition = "JSON", nullable = false)
    private String parameters;

    @Column(columnDefinition = "JSON", nullable = false)
    private String results;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "accuracy_score")
    private BigDecimal accuracyScore;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SimulationStatus status = SimulationStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
