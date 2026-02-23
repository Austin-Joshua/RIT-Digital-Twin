package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Student extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_record_id")
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "student_id_number", unique = true, nullable = false)
    private String studentIdNumber;

    @Column(name = "academic_year")
    private Integer year;

    @Column(name = "section")
    private String section;

    @Column(name = "current_cgpa")
    private Double currentCgpa;

    @Column(name = "arrear_count")
    private Integer arrearCount;
}
