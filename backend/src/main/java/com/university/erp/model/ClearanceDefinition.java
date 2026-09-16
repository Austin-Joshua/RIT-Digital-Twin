package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clearance_definitions", indexes = {
        @Index(name = "idx_clearance_active", columnList = "active"),
        @Index(name = "idx_clearance_authority", columnList = "authority_type"),
        @Index(name = "idx_clearance_dept", columnList = "department_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClearanceDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    private String description;

    @Column(name = "authority_type", nullable = false, length = 50)
    private String authorityType; // LIBRARY, LAB, HOSTEL, FINANCE, PLACEMENT, DEPARTMENT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
