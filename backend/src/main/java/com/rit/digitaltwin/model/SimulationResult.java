package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sim_id")
    private Long simId;

    // Alias for getSimId
    public Long getId() {
        return simId;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "sim_type", nullable = false)
    private SimulationType simType; // CLASSROOM, ENERGY, TRANSPORT

    @Column(name = "simulation_name")
    private String simulationName;

    @Column(name = "parameters_json", columnDefinition = "TEXT")
    private String parametersJson;

    @Column(name = "result_json", columnDefinition = "TEXT")
    private String resultJson;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SimulationStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
