package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Column(nullable = false)
    private String action;

    @Column(name = "action_time", nullable = false)
    private LocalDateTime actionTime;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "affected_user_id")
    private Long affectedUserId;

    @Column(name = "ip_address")
    private String ipAddress;
}
