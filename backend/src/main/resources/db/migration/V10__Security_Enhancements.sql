-- Add security-related columns to users
ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN lock_until DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN last_password_change DATETIME DEFAULT NULL;

-- Create login_logs table
CREATE TABLE IF NOT EXISTS login_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(255),
    ip_address VARCHAR(45),
    login_time DATETIME NOT NULL,
    status VARCHAR(50),
    reason TEXT,
    CONSTRAINT fk_login_logs_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    affected_user_id BIGINT,
    ip_address VARCHAR(45),
    action_time DATETIME NOT NULL,
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(user_id)
);
