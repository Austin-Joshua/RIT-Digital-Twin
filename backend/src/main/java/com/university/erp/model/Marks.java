package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Marks extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    private Integer semester;

    // CAT Exams
    @Column(precision = 5, scale = 2)
    private Double cat1Score; // Max 50 (Covers units 1-2)

    @Column(precision = 5, scale = 2)
    private Double cat2Score; // Max 25 (Covers unit 3)

    @Column(precision = 5, scale = 2)
    private Double cat3Score; // Max 50 (Covers units 4-5)

    // Other Internals
    @Column(precision = 5, scale = 2)
    private Double assignmentScore; // Max 50

    @Column(precision = 5, scale = 2)
    private Double attendancePercentage; // 0-100%

    // Calculated Internal (Max 40)
    @Column(precision = 5, scale = 2)
    private Double calculatedInternal;

    // Final Exam
    @Column(precision = 5, scale = 2)
    private Double finalExamScore; // Written for 100

    @Column(precision = 5, scale = 2)
    private Double finalConvertedScore; // Converted to 60

    // Final result
    @Column(precision = 5, scale = 2)
    private Double totalScore; // Internal (40) + Final (60) = 100

    private String grade;
}
