package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "career_recommendations")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CareerRecommendation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "recommended_domain")
    private String recommendedDomain;

    @Column(name = "suggested_certifications", columnDefinition = "TEXT")
    private String suggestedCertifications;

    @Column(name = "skill_gap_analysis", columnDefinition = "TEXT")
    private String skillGapAnalysis;

    @Column(name = "placement_probability")
    private Double placementProbability;

}
