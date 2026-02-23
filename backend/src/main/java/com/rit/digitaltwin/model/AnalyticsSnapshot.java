package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "analytics_snapshots")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSnapshot extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "academic_year")
    private Integer academicYear;

    @Column(name = "semester")
    private Integer semester;

    @Column(name = "avg_cgpa")
    private Double avgCgpa;

    @Column(name = "pass_percentage")
    private Double passPercentage;

    @Column(name = "attendance_distribution", columnDefinition = "TEXT") // JSON
    private String attendanceDistribution;

    @Column(name = "risk_distribution", columnDefinition = "TEXT") // JSON
    private String riskDistribution;

    @Column(name = "placement_readiness_index")
    private Double placementReadinessIndex;

}
