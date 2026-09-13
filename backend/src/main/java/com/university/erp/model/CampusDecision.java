package com.university.erp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "campus_decision")
public class CampusDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "problem_key", nullable = false, length = 180)
    private String problemKey;

    @Column(name = "problem_title", length = 300)
    private String problemTitle;

    @Column(name = "option_id", nullable = false, length = 64)
    private String optionId;

    @Column(name = "option_label", length = 180)
    private String optionLabel;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "expected_impact", length = 1000)
    private String expectedImpact;

    @Column(name = "baseline_value")
    private Double baselineValue;

    @Column(name = "expected_value")
    private Double expectedValue;

    @Column(name = "metric_label", length = 80)
    private String metricLabel;

    @Column(name = "authorized_by", length = 80)
    private String authorizedBy;

    @Column(name = "authorized_at")
    private LocalDateTime authorizedAt;

    @Column(name = "outcome_note", length = 1000)
    private String outcomeNote;

    @Column(name = "outcome_at")
    private LocalDateTime outcomeAt;

    @Column(name = "applied_to_campus", nullable = false)
    private boolean appliedToCampus;
}
