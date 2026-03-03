package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "revaluation_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class RevaluationRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marks_id", nullable = false)
    private Marks originalMarks;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String reason;
    private String adminRemarks;
    private String hodRemarks;

    public enum RequestStatus {
        PENDING, ADMIN_APPROVED, HOD_APPROVED, FACULTY_UPDATED, REJECTED
    }
}
