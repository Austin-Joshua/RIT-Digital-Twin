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
    private Double cat1Score; // Max 50 (Covers units 1-2)

    private Double cat2Score; // Max 25 (Covers unit 3)

    private Double cat3Score; // Max 50 (Covers units 4-5)

    // Other Internals
    private Double assignmentScore; // Max 50

    private Double attendancePercentage; // 0-100%

    // Calculated Internal (Max 40)
    private Double calculatedInternal;

    // Final Exam
    private Double finalExamScore; // Written for 100

    private Double finalConvertedScore; // Converted to 60

    // Final result
    private Double totalScore; // Internal (40) + Final (60) = 100

    private String grade;
}
