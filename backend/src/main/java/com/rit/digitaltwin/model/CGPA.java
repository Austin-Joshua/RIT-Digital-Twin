package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_cgpa")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CGPA extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cgpa_id")
    private Long cgpaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "semester", nullable = false)
    private Integer semester;

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "cumulative_cgpa")
    private Double cumulativeCgpa;

    @Column(name = "total_credits")
    private Integer totalCredits;
}
