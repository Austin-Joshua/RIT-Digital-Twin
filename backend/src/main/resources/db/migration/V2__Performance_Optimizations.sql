-- RIT Digital Twin Performance Optimization Script (idempotent + safe)

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

