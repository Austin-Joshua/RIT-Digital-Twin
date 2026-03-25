-- V11__Ultra_Performance_Optimization.sql
-- High-performance secondary indexes for "no-time" data retrieval

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_username_email');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_users_username_email ON users(username, email)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'students');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'students' AND index_name = 'idx_students_name_section');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_students_name_section ON students(student_name, section)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'students' AND index_name = 'idx_students_reg_no');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_students_reg_no ON students(register_no)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'attendance_records');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_records' AND index_name = 'idx_attendance_sub_date');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_attendance_sub_date ON attendance_records(student_subject_id, date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'grades');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'grades' AND index_name = 'idx_grades_student_sem');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_grades_student_sem ON grades(student_id, semester_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'audit_logs');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND index_name = 'idx_audit_logs_time');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_audit_logs_time ON audit_logs(action_time)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'login_logs');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'login_logs' AND index_name = 'idx_login_logs_time');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_login_logs_time ON login_logs(login_time)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
