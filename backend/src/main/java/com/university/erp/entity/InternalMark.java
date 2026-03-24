package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "internal_marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternalMark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "internal_id")
    private Long internalId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_subject_id", nullable = false, unique = true)
    private StudentSubject studentSubject;

    @Column(name = "cat1_marks")
    private BigDecimal cat1Marks;
    @Column(name = "cat2_marks")
    private BigDecimal cat2Marks;
    @Column(name = "cat3_marks")
    private BigDecimal cat3Marks;
    @Column(name = "assignment_marks")
    private BigDecimal assignmentMarks;
    @Column(name = "attendance_marks")
    private BigDecimal attendanceMarks;
    @Column(name = "total_internal")
    private BigDecimal totalInternal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}
