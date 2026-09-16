CREATE TABLE IF NOT EXISTS campus_alert_state (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_key VARCHAR(180) NOT NULL,
    status VARCHAR(32) NOT NULL,
    updated_at TIMESTAMP NULL,
    updated_by VARCHAR(80) NULL,
    UNIQUE KEY uk_campus_alert_key (alert_key)
);
