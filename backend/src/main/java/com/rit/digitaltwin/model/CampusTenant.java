package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "campus_tenants")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CampusTenant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code; // e.g., RIT-CH, RIT-CHN

    @Column(unique = true)
    private String subdomain;

    @Column(name = "contact_info")
    private String contactInfo;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;
}
