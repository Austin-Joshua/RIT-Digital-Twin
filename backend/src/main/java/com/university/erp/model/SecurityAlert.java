package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "security_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class SecurityAlert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "severity", nullable = false, length = 20)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "alert_type", nullable = false, length = 80)
    private String alertType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "user_id_ref")
    private Long userIdRef;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "action_name", length = 120)
    private String actionName;

    @Column(name = "changed_values", columnDefinition = "TEXT")
    private String changedValues;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "resolved", nullable = false)
    @Builder.Default
    private boolean resolved = false;
}
