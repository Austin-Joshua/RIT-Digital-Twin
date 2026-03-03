package com.university.erp.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_student_id_num", columnList = "student_id_number"),
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_dept_id", columnList = "dept_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Student extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "student_id_number", unique = true, nullable = false)
    private String studentIdNumber;

    @Column(name = "academic_year")
    private Integer year;

    private String section;
    private BigDecimal currentCgpa;
    private Integer arrearCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private Department department;
}
