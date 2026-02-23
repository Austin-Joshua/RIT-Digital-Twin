package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rankings")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Ranking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_record_id", nullable = false)
    private Student student;

    @Column(name = "department_rank")
    private Integer departmentRank;

    @Column(name = "class_rank")
    private Integer classRank;

    @Column(name = "semester_rank")
    private Integer semesterRank;

    @Column(name = "improvement_rank")
    private Integer improvementRank;
}
