package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "bus_stops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stop_id")
    private Long stopId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "route_id", nullable = false)
    private TransportRoute route;

    @Column(name = "stop_name", nullable = false)
    private String stopName;

    @Column(name = "student_count")
    private int studentCount;

    @Column(name = "arrival_time")
    private LocalTime arrivalTime;
}
