package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "data_change_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class DataChangeAuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, length = 80)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 80)
    private String entityId;

    @Column(name = "stage", nullable = false, length = 20)
    private String stage; // BEFORE, DURING, AFTER

    @Column(name = "action", nullable = false, length = 120)
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "session_id", length = 200)
    private String sessionId;

    @Column(name = "location", length = 120)
    private String location;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "changed_fields", columnDefinition = "TEXT")
    private String changedFields;

    @Column(name = "checksum_before", length = 128)
    private String checksumBefore;

    @Column(name = "checksum_after", length = 128)
    private String checksumAfter;

    @Column(name = "tampering_detected", nullable = false)
    @Builder.Default
    private boolean tamperingDetected = false;
}
