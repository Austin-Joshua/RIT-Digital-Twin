package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "buildings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Building extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code; // e.g., MAIN, LAB, HOSTEL_A

    private Integer totalCapacity;

    @Column(name = "base_energy_load", precision = 10, scale = 2)
    private BigDecimal baseEnergyLoad; // kW per hour baseline

    private String location; // Lat, Long or simple description
}
