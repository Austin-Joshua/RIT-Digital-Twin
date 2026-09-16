package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "no_due_requests", uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_clearance", columnNames = { "student_id", "clearance_type" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoDueRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clearance_definition_id")
    private ClearanceDefinition clearanceDefinition;

    @Column(name = "clearance_type", nullable = false)
    private String clearanceType; // e.g. "Library", "Hostel", "Department Lab", "Accounts", "Placement Cell"

    private String subjectCode;

    @Builder.Default
    private String status = "PENDING"; // NOT_REQUESTED, PENDING, APPROVED, REJECTED

    @Column(name = "previous_status")
    private String previousStatus;

    private String remarks;

    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejected_by")
    private User rejectedBy;

    @Column(name = "ip_address")
    private String ipAddress;

    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
    }
}
