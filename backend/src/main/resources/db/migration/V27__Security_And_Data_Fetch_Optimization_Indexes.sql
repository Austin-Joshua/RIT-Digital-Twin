SET @tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'students' AND index_name = 'idx_students_section_dept_status'
);
SET @dept_col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'dept_id'
);
SET @section_col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'section'
);
SET @status_col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'status'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0 AND @dept_col_exists = 1 AND @section_col_exists = 1 AND @status_col_exists = 1,
    'CREATE INDEX idx_students_section_dept_status ON students(section, dept_id, status)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'login_logs'
);
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'login_logs' AND index_name = 'idx_login_logs_ip_status_time'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0,
    'CREATE INDEX idx_login_logs_ip_status_time ON login_logs(ip_address, status, login_time)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'data_change_audit_logs'
);
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'data_change_audit_logs' AND index_name = 'idx_dcal_entity_created'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0,
    'CREATE INDEX idx_dcal_entity_created ON data_change_audit_logs(entity_type, entity_id, created_at)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
