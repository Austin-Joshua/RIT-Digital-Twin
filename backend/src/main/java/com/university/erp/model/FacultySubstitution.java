package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_substitutions", indexes = {
        @Index(name = "idx_sub_orig_date", columnList = "original_faculty_id, substitutionDate"),
        @Index(name = "idx_sub_subst_date", columnList = "substitute_faculty_id, substitutionDate"),
        @Index(name = "idx_sub_slot_date", columnList = "timetable_slot_id, substitutionDate"),
        @Index(name = "idx_sub_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class FacultySubstitution extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_faculty_id", nullable = false)
    private User originalFaculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "substitute_faculty_id", nullable = false)
    private User substituteFaculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_slot_id", nullable = false)
    private TimetableSlot timetableSlot;

    @Column(nullable = false)
    private LocalDate substitutionDate;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false, length = 50)
    private String status; // PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, COMPLETED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actioned_by_id")
    private User actionedBy;

    private LocalDateTime actionedAt;

    @Column(length = 500)
    private String actionRemarks;

    public TimetableSlot getSlot() {
        return this.timetableSlot;
    }
}
