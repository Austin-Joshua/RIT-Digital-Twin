-- V20: Clean up stale dept_id column from departments table
-- This column was added by Hibernate ddl-auto=update when getDeptId() was
-- erroneously treated as a persistent property (Hibernate 6 alias getter bug).
-- The true PK column is 'id' (renamed by V13 from the original dept_id PK).
-- If a *non-PK* dept_id column exists alongside id, we drop it safely.

SET @dbname = DATABASE();

-- Step 1: Drop stale FK constraints that reference departments.dept_id
-- (recreated in V19 to reference departments.id, so safe to clean duplicates)
SET @fk1 = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'departments'
      AND COLUMN_NAME = 'dept_id'
      AND REFERENCED_TABLE_NAME IS NULL
    LIMIT 1
);

-- Step 2: Check if a non-PK dept_id column exists on departments
--         (PK column would have COLUMN_KEY = 'PRI'; we want to drop only extra ones)
SET @stale_dept_id_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'departments'
      AND COLUMN_NAME = 'dept_id'
      AND COLUMN_KEY != 'PRI'
);

-- Step 3: Also check that the proper PK column 'id' exists (safety guard)
SET @pk_id_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'departments'
      AND COLUMN_NAME = 'id'
      AND COLUMN_KEY = 'PRI'
);

-- Only drop the stale dept_id if it's a non-PK column AND we have the proper 'id' PK
SET @sql_drop = IF(
    @stale_dept_id_exists > 0 AND @pk_id_exists > 0,
    'ALTER TABLE departments DROP COLUMN dept_id',
    'SELECT 1 -- No stale dept_id column found, nothing to clean'
);
PREPARE stmt FROM @sql_drop;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Clean up phantom columns added by Hibernate to other tables
-- roles.id (phantom from Role.getId() getter picked up by Hibernate)
SET @roles_phantom_id = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'roles'
      AND COLUMN_NAME = 'id' AND COLUMN_KEY != 'PRI'
);
SET @sql_roles = IF(@roles_phantom_id > 0,
    'ALTER TABLE roles DROP COLUMN id',
    'SELECT 1'
);
PREPARE stmt FROM @sql_roles; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- users.id (phantom from User.getId() getter)
SET @users_phantom_id = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'id' AND COLUMN_KEY != 'PRI'
);
SET @sql_users = IF(@users_phantom_id > 0,
    'ALTER TABLE users DROP COLUMN id',
    'SELECT 1'
);
PREPARE stmt FROM @sql_users; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- students.student_id (phantom from Student.getStudentId() getter)
SET @students_phantom = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'students'
      AND COLUMN_NAME = 'student_id' AND COLUMN_KEY != 'PRI'
);
SET @sql_students = IF(@students_phantom > 0,
    'ALTER TABLE students DROP COLUMN student_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql_students; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- subjects.subject_id (phantom from Subject.getSubjectId() getter)
SET @subjects_phantom = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'subjects'
      AND COLUMN_NAME = 'subject_id' AND COLUMN_KEY != 'PRI'
);
SET @sql_subjects = IF(@subjects_phantom > 0,
    'ALTER TABLE subjects DROP COLUMN subject_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql_subjects; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- marks.mark_id (phantom from Marks.getMarkId() getter)
SET @marks_phantom = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'marks'
      AND COLUMN_NAME = 'mark_id' AND COLUMN_KEY != 'PRI'
);
SET @sql_marks = IF(@marks_phantom > 0,
    'ALTER TABLE marks DROP COLUMN mark_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql_marks; EXECUTE stmt; DEALLOCATE PREPARE stmt;
