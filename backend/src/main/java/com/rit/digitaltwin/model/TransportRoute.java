package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transport_routes")
public class TransportRoute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String routeName;
    private String startPoint;
    private String endPoint;
    private Double totalDistanceKm;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL)
    private List<BusStop> stops;
}
