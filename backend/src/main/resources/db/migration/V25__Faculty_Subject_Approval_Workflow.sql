SET @tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'faculty_subjects'
);

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'approval_status'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE faculty_subjects ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT ''APPROVED''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'requested_by_user_id'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE faculty_subjects ADD COLUMN requested_by_user_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'approved_by_user_id'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE faculty_subjects ADD COLUMN approved_by_user_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'approved_at'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE faculty_subjects ADD COLUMN approved_at TIMESTAMP NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@tbl_exists = 1,
    'UPDATE faculty_subjects SET approval_status = ''APPROVED'' WHERE approval_status IS NULL OR approval_status = ''''''',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'fk_fac_sub_requested_by'
);
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'requested_by_user_id'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 1 AND @fk_exists = 0,
    'ALTER TABLE faculty_subjects ADD CONSTRAINT fk_fac_sub_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'fk_fac_sub_approved_by'
);
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'approved_by_user_id'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 1 AND @fk_exists = 0,
    'ALTER TABLE faculty_subjects ADD CONSTRAINT fk_fac_sub_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND index_name = 'idx_fac_sub_approval_status'
);
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'approval_status'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 1 AND @idx_exists = 0,
    'CREATE INDEX idx_fac_sub_approval_status ON faculty_subjects (approval_status)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND index_name = 'idx_fac_sub_approval_dept_section'
);
SET @approval_col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'approval_status'
);
SET @section_col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'faculty_subjects'
      AND column_name = 'section'
);
SET @sql = IF(@tbl_exists = 1 AND @approval_col_exists = 1 AND @section_col_exists = 1 AND @idx_exists = 0,
    'CREATE INDEX idx_fac_sub_approval_dept_section ON faculty_subjects (approval_status, section)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
