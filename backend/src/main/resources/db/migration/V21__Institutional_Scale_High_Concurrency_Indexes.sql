-- V21: Institutional-Scale High-Concurrency Indexes
-- Optimized for 1000s of simultaneous users performing departmental analytics

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'students');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'students' AND index_name = 'idx_students_scaling_composite');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_students_scaling_composite ON students(dept_id, academic_year, section)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_scaling_role_dept');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_users_scaling_role_dept ON users(role_id, dept_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'marks');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'marks' AND index_name = 'idx_marks_scaling_subject_sem');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_marks_scaling_subject_sem ON marks(subject_id, semester)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'attendance');
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance' AND index_name = 'idx_attendance_scaling_student_subject');
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_attendance_scaling_student_subject ON attendance(student_id, subject_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
