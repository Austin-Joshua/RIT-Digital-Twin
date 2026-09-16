-- V19__Fix_Department_FK_Constraints.sql
-- After V13 renamed departments.dept_id → departments.id,
-- any FK constraints that Hibernate created referencing departments(dept_id)
-- are now stale. This migration drops and cleanly recreates those constraints
-- so they reference the current PK column departments(id).
-- ALL operations are fully guarded for idempotency.

SET FOREIGN_KEY_CHECKS = 0;

-- Confirm departments.id (new PK name) actually exists before we do anything
SET @dept_id_ok = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name   = 'departments'
      AND column_name  = 'id'
);

-- ─────────────────────────────────────────────────────
-- TABLE: users  (column: dept_id → references departments)
-- ─────────────────────────────────────────────────────
SET @u_tbl = (SELECT COUNT(*) FROM information_schema.tables
              WHERE table_schema = DATABASE() AND table_name = 'users');
SET @u_col = (SELECT COUNT(*) FROM information_schema.columns
              WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'dept_id');

-- Find the name of any existing FK on users(dept_id) → departments
SET @u_fk = (
    SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'users'
      AND COLUMN_NAME  = 'dept_id'
      AND REFERENCED_TABLE_NAME = 'departments'
    LIMIT 1
);
-- Drop it
SET @sql = IF(@u_tbl = 1 AND @u_fk IS NOT NULL AND CHAR_LENGTH(@u_fk) > 0,
    CONCAT('ALTER TABLE users DROP FOREIGN KEY `', @u_fk, '`'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Check no FK already points to departments.id (clean state)
SET @u_fk_clean = (
    SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'users'
      AND COLUMN_NAME  = 'dept_id'
      AND REFERENCED_TABLE_NAME   = 'departments'
      AND REFERENCED_COLUMN_NAME  = 'id'
);
-- Recreate pointing to the new PK name: departments.id
SET @sql = IF(@u_tbl = 1 AND @u_col = 1 AND @dept_id_ok = 1 AND @u_fk_clean = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (dept_id) REFERENCES departments (id) ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ─────────────────────────────────────────────────────
-- TABLE: students  (column: dept_id → references departments)
-- ─────────────────────────────────────────────────────
SET @s_tbl = (SELECT COUNT(*) FROM information_schema.tables
              WHERE table_schema = DATABASE() AND table_name = 'students');
SET @s_col = (SELECT COUNT(*) FROM information_schema.columns
              WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'dept_id');

SET @s_fk = (
    SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'students'
      AND COLUMN_NAME  = 'dept_id'
      AND REFERENCED_TABLE_NAME = 'departments'
    LIMIT 1
);
SET @sql = IF(@s_tbl = 1 AND @s_fk IS NOT NULL AND CHAR_LENGTH(@s_fk) > 0,
    CONCAT('ALTER TABLE students DROP FOREIGN KEY `', @s_fk, '`'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @s_fk_clean = (
    SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'students'
      AND COLUMN_NAME  = 'dept_id'
      AND REFERENCED_TABLE_NAME  = 'departments'
      AND REFERENCED_COLUMN_NAME = 'id'
);
SET @sql = IF(@s_tbl = 1 AND @s_col = 1 AND @dept_id_ok = 1 AND @s_fk_clean = 0,
    'ALTER TABLE students ADD CONSTRAINT fk_students_department FOREIGN KEY (dept_id) REFERENCES departments (id) ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ─────────────────────────────────────────────────────
-- TABLE: timetable_slots  (column: dept_id → references departments)
-- ─────────────────────────────────────────────────────
SET @ts_tbl = (SELECT COUNT(*) FROM information_schema.tables
               WHERE table_schema = DATABASE() AND table_name = 'timetable_slots');
SET @ts_col = (SELECT COUNT(*) FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'timetable_slots' AND column_name = 'dept_id');

SET @ts_fk = (
    SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'timetable_slots'
      AND COLUMN_NAME  = 'dept_id'
      AND REFERENCED_TABLE_NAME = 'departments'
    LIMIT 1
);
SET @sql = IF(@ts_tbl = 1 AND @ts_fk IS NOT NULL AND CHAR_LENGTH(@ts_fk) > 0,
    CONCAT('ALTER TABLE timetable_slots DROP FOREIGN KEY `', @ts_fk, '`'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ts_fk_clean = (
    SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'timetable_slots'
      AND COLUMN_NAME  = 'dept_id'
      AND REFERENCED_TABLE_NAME  = 'departments'
      AND REFERENCED_COLUMN_NAME = 'id'
);
SET @sql = IF(@ts_tbl = 1 AND @ts_col = 1 AND @dept_id_ok = 1 AND @ts_fk_clean = 0,
    'ALTER TABLE timetable_slots ADD CONSTRAINT fk_timetable_department FOREIGN KEY (dept_id) REFERENCES departments (id) ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


SET FOREIGN_KEY_CHECKS = 1;
