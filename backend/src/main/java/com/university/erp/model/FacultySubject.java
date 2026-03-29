package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculty_subjects", uniqueConstraints = {
        @UniqueConstraint(name = "uq_fac_sub", columnNames = { "faculty_id", "subject_id", "section", "semester_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultySubject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faculty_subject_id")
    private Long facultySubjectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyProfile faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "academic_year")
    private Integer academicYear;

    private String section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;
}
