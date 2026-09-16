-- V22: Production Audit, Analytics, and Notification Scaling
-- Optimized for institutional-scale history tracking and real-time alerts

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'audit_logs');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND index_name = 'idx_audit_scaling_time_user');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_audit_scaling_time_user ON audit_logs(timestamp, user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'notifications');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notifications' AND index_name = 'idx_notify_scaling_user_read');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_notify_scaling_user_read ON notifications(user_id, is_read, created_at DESC)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'mark_history');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'mark_history' AND index_name = 'idx_mark_hist_scaling_mark_id');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_mark_hist_scaling_mark_id ON mark_history(mark_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'faculty_profiles');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'faculty_profiles' AND index_name = 'idx_fac_scaling_dept');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_fac_scaling_dept ON faculty_profiles(department)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
