CREATE TABLE IF NOT EXISTS campus_decision (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_key VARCHAR(180) NOT NULL,
    problem_title VARCHAR(300) NULL,
    option_id VARCHAR(64) NOT NULL,
    option_label VARCHAR(180) NULL,
    status VARCHAR(32) NOT NULL,
    expected_impact VARCHAR(1000) NULL,
    baseline_value DOUBLE NULL,
    expected_value DOUBLE NULL,
    metric_label VARCHAR(80) NULL,
    authorized_by VARCHAR(80) NULL,
    authorized_at TIMESTAMP NULL,
    outcome_note VARCHAR(1000) NULL,
    outcome_at TIMESTAMP NULL,
    applied_to_campus BOOLEAN NOT NULL DEFAULT FALSE
);
