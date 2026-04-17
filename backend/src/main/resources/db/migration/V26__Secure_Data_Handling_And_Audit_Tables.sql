CREATE TABLE IF NOT EXISTS data_change_audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    stage VARCHAR(20) NOT NULL,
    action VARCHAR(120) NOT NULL,
    actor_id BIGINT NULL,
    actor_user_id BIGINT NULL,
    ip_address VARCHAR(64) NULL,
    device_info VARCHAR(500) NULL,
    session_id VARCHAR(200) NULL,
    location VARCHAR(120) NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    changed_fields TEXT NULL,
    checksum_before VARCHAR(128) NULL,
    checksum_after VARCHAR(128) NULL,
    tampering_detected TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dcal_actor FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_dcal_entity_stage_time ON data_change_audit_logs(entity_type, entity_id, stage, created_at);
CREATE INDEX idx_dcal_tamper ON data_change_audit_logs(tampering_detected, created_at);

CREATE TABLE IF NOT EXISTS security_alerts (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    severity VARCHAR(20) NOT NULL,
    alert_type VARCHAR(80) NOT NULL,
    user_id BIGINT NULL,
    user_id_ref BIGINT NULL,
    ip_address VARCHAR(64) NULL,
    action_name VARCHAR(120) NULL,
    changed_values TEXT NULL,
    message TEXT NOT NULL,
    resolved TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_security_alert_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_security_alert_severity ON security_alerts(severity, resolved, created_at);

CREATE TABLE IF NOT EXISTS access_activity_logs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    user_id_ref BIGINT NULL,
    username VARCHAR(160) NULL,
    ip_address VARCHAR(64) NULL,
    device_info VARCHAR(500) NULL,
    session_id VARCHAR(200) NULL,
    location VARCHAR(120) NULL,
    request_path VARCHAR(500) NULL,
    request_method VARCHAR(16) NULL,
    response_status INT NULL,
    request_pattern VARCHAR(120) NULL,
    risk_level VARCHAR(20) NULL,
    masked_ip_suspected TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_access_log_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_access_log_user_time ON access_activity_logs(user_id_ref, created_at);
CREATE INDEX idx_access_log_risk ON access_activity_logs(risk_level, created_at);
CREATE INDEX idx_access_log_masked_ip ON access_activity_logs(masked_ip_suspected, created_at);
