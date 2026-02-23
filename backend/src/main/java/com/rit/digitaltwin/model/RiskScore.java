package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "risk_scores")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class RiskScore extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_record_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Column(name = "failure_probability")
    private Double failureProbability;

    @Column(name = "suggested_actions", columnDefinition = "TEXT")
    private String suggestedActions;

    public enum RiskLevel {
        LOW, MEDIUM, HIGH
    }
}
