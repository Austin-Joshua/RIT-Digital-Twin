package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "student_academics", uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_academics_student_sem", columnNames = { "student_id", "semester" })
}, indexes = {
        @Index(name = "idx_student_academics_student", columnList = "student_id"),
        @Index(name = "idx_student_academics_semester", columnList = "semester")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class StudentAcademic extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal gpa;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal cgpa;
}
