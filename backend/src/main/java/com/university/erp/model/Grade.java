package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "grades", indexes = {
        @Index(name = "idx_grades_student_id", columnList = "student_id"),
        @Index(name = "idx_grades_subject_id", columnList = "subject_id"),
        @Index(name = "idx_grades_semester_id", columnList = "semester_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Grade extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grade_id")
    private Long gradeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "internal_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal internalMarks;

    @Column(name = "external_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal externalMarks;

    @Column(name = "total_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "grade_letter", nullable = false, length = 5)
    private String gradeLetter;

    @Column(name = "grade_points", nullable = false, precision = 4, scale = 2)
    private BigDecimal gradePoints;
}
