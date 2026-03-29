package com.university.erp.model;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marks", indexes = {
        @Index(name = "idx_student_subject", columnList = "student_id, subject_id"),
        @Index(name = "idx_semester", columnList = "semester"),
        @Index(name = "idx_student_id", columnList = "student_id"),
        @Index(name = "idx_subject_id", columnList = "subject_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Marks extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getMarkId() {
        return id;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    private Integer semester;

    // CAT Exams
    private BigDecimal cat1Score; // Max 50 (Covers units 1-2)

    private BigDecimal cat2Score; // Max 25 (Covers unit 3)

    private BigDecimal cat3Score; // Max 50 (Covers units 4-5)

    // Other Internals
    private BigDecimal assignmentScore; // Max 50

    private BigDecimal attendancePercentage; // 0-100%

    // Calculated Internal (Max 40)
    private BigDecimal calculatedInternal;

    // Final Exam
    private BigDecimal finalExamScore; // Written for 100

    private BigDecimal finalConvertedScore; // Converted to 60

    // Final result
    private BigDecimal totalScore; // Internal (40) + Final (60) = 100

    private String grade;
}
