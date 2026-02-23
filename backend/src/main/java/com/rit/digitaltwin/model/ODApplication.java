package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "od_applications")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ODApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "od_id")
    private Long odId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "date_applied", nullable = false)
    private LocalDate date;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "reason")
    private String reason;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "status")
    private String status; // PENDING, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Faculty approvedBy;
}
