package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable_subject_requirements", uniqueConstraints = {
        @UniqueConstraint(name = "uq_timetable_requirement_scope_subject", columnNames = { "dept_id", "semester_id", "section", "subject_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class TimetableSubjectRequirement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id")
    private Semester semester;

    @Column(nullable = false)
    private String section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "periods_per_week", nullable = false)
    private Integer periodsPerWeek;
}
