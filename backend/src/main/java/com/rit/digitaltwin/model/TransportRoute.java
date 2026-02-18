package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transport_routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String routeCode;

    @Column(nullable = false, length = 150)
    private String routeName;

    @Column(length = 100)
    private String origin;

    @Column(length = 100)
    private String destination;

    @Column(name = "distance_km", precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "estimated_duration_min")
    private Integer estimatedDurationMin;

    @Column(name = "total_stops")
    private Integer totalStops;

    @Column(name = "student_count")
    private Integer studentCount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.BUS;

    @Column(name = "fuel_consumption_per_km", precision = 6, scale = 3)
    private BigDecimal fuelConsumptionPerKm;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
