package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transport_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class TransportRoute extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String routeNumber;

    @Column(nullable = false)
    private String routeName;

    private String startPoint;
    private String endPoint;
    private String busNumber;
    private Integer capacity;
    private Integer currentOccupancy;

    private String coordinatorName;
    private String coordinatorPhone;
}
