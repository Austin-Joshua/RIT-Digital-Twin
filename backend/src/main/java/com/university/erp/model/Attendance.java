package com.university.erp.model;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.*;

@Entity(name="ModelAttendance")
@Table(name = "model_attendance", indexes = {
        @Index(name = "idx_student_subject_attendance", columnList = "student_id, subject_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Attendance extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    private BigDecimal percentage;
    private Integer totalClasses;
    private Integer attendedClasses;
}
