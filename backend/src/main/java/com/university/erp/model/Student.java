package com.university.erp.model;

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

    @Transient
    public Long getStudentId() {
        return id;
    }

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "student_id_number", unique = true, nullable = false)
    private String studentIdNumber;

    @Column(name = "register_no", unique = true)
    private String registerNo;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "academic_year")
    private Integer year;

    private String section;
    @Column(name = "batch_label")
    private String batch;
    @Column(name = "scholar_type")
    private String scholarType;
    @Column(name = "contact_email")
    private String email;
    private String phone;
    private String status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_id")
    private Curriculum curriculum;
    private Integer currentSemester;
    private BigDecimal currentCgpa;
    private Integer arrearCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private Department department;
}
