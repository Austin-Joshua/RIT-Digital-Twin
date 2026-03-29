-- V17__Align_User_Security_Columns.sql
-- Safely add missing columns to users table to match JPA entity 'User'

SET @dbname = DATABASE();

-- 1. account_status
SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'users');
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'users' AND column_name = 'account_status');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT "active"', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. must_change_password
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'users' AND column_name = 'must_change_password');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. failed_login_attempts
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'users' AND column_name = 'failed_login_attempts');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. lock_until
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'users' AND column_name = 'lock_until');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN lock_until DATETIME DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. last_login
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'users' AND column_name = 'last_login');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN last_login DATETIME DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. last_password_change
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'users' AND column_name = 'last_password_change');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN last_password_change DATETIME DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 7. linked_student_id
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'users' AND column_name = 'linked_student_id');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN linked_student_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. Fix departments PK if not already renamed (redundant to V13 but safe)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'departments' AND column_name = 'dept_id');
SET @sql = IF(@col_exists = 1, 'ALTER TABLE departments CHANGE COLUMN dept_id id BIGINT NOT NULL AUTO_INCREMENT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
