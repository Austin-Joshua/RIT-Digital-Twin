package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bus_stops", indexes = {
        @Index(name = "idx_bus_stop_route", columnList = "route_id"),
        @Index(name = "idx_bus_stop_name", columnList = "stop_name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stop_name", nullable = false, length = 150)
    private String stopName;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(name = "avg_boarding_count")
    private Integer avgBoardingCount;

    @Column(name = "avg_alighting_count")
    private Integer avgAlightingCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private TransportRoute route;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
