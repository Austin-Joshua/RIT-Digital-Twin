package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "access_activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class AccessActivityLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "user_id_ref")
    private Long userIdRef;

    @Column(name = "username", length = 160)
    private String username;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "session_id", length = 200)
    private String sessionId;

    @Column(name = "location", length = 120)
    private String location;

    @Column(name = "request_path", length = 500)
    private String requestPath;

    @Column(name = "request_method", length = 16)
    private String requestMethod;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "request_pattern", length = 120)
    private String requestPattern;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "masked_ip_suspected", nullable = false)
    @Builder.Default
    private boolean maskedIpSuspected = false;
}
