package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "transport_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransportRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    private Long routeId;

    @Column(name = "route_name", nullable = false)
    private String routeName;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "vehicle_number", nullable = false, unique = true)
    private String vehicleNumber;

    @Column(nullable = false)
    private int capacity;

    @Column(name = "fuel_efficiency_kmpl")
    private Double fuelEfficiencyKmpl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
