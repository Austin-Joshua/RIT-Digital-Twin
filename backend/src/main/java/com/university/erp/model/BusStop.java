package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "bus_stops", indexes = {
        @Index(name = "idx_route_id", columnList = "route_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private TransportRoute route;

    @Column(nullable = false)
    private String stopName;

    private LocalTime pickupTime;

    @Column(nullable = false)
    private Integer stopOrder;

    private String landmark;

    private Integer studentCount;
}
