-- V16__Fix_Grades_Precision.sql
-- Force the local database to use DECIMAL(5,2) for marks to prevent data truncation during seeding

SET FOREIGN_KEY_CHECKS=0;

-- Ensure 'grades' table has enough precision for 100.00 (5 digits total, 2 after decimal)
ALTER TABLE grades MODIFY COLUMN internal_marks DECIMAL(5,2) NOT NULL;
ALTER TABLE grades MODIFY COLUMN external_marks DECIMAL(5,2) NOT NULL;
ALTER TABLE grades MODIFY COLUMN total_marks DECIMAL(5,2) NOT NULL;

-- Ensure 'grade_points' can handle 10.00 (4 digits total, 2 after decimal)
ALTER TABLE grades MODIFY COLUMN grade_points DECIMAL(4,2) NOT NULL;

-- Fix 'StudentAcademic' potential truncation if CGPA/GPA uses the same column logic
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'student_academic' AND column_name = 'cgpa');
SET @sql = IF(@col_exists = 1, 'ALTER TABLE student_academic MODIFY COLUMN cgpa DECIMAL(4,2)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS=1;
