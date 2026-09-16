-- V18__Fix_Grades_Precision.sql
-- Guard all ALTER TABLE statements with table existence checks.
-- Ensures DECIMAL precision is correct for grades without crashing on missing tables.

SET FOREIGN_KEY_CHECKS=0;

SET @grades_tbl = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'grades'
);

-- internal_marks
SET @sql = IF(@grades_tbl = 1, 'ALTER TABLE grades MODIFY COLUMN internal_marks DECIMAL(5,2) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- external_marks
SET @sql = IF(@grades_tbl = 1, 'ALTER TABLE grades MODIFY COLUMN external_marks DECIMAL(5,2) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- total_marks
SET @sql = IF(@grades_tbl = 1, 'ALTER TABLE grades MODIFY COLUMN total_marks DECIMAL(5,2) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- grade_points
SET @sql = IF(@grades_tbl = 1, 'ALTER TABLE grades MODIFY COLUMN grade_points DECIMAL(4,2) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fix student_academics.cgpa (table name corrected from student_academic to student_academics per V7)
SET @sa_tbl = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'student_academics'
);
SET @cgpa_col = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'student_academics' AND column_name = 'cgpa'
);
SET @sql = IF(@sa_tbl = 1 AND @cgpa_col = 1, 'ALTER TABLE student_academics MODIFY COLUMN cgpa DECIMAL(4,2)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS=1;
