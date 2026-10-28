-- V41: Enterprise Academic Data Model, Multi-Year Scoping, and High-Scale Indexing
-- Idempotent, safe migration that preserves existing production data and schema integrity.

SET @dbname = DATABASE();

-- =========================================================================
-- 1. ACADEMIC YEARS TABLE: Core Institutional Calendar Entity
-- =========================================================================

CREATE TABLE IF NOT EXISTS academic_years (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    year_code VARCHAR(30) NOT NULL UNIQUE,
    start_date DATE NULL,
    end_date DATE NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_academic_years_code (year_code),
    INDEX idx_academic_years_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Populate default operational academic years if empty
INSERT IGNORE INTO academic_years (year_code, start_date, end_date, is_current, status) VALUES
('2023-2024', '2023-08-01', '2024-05-31', FALSE, 'ARCHIVED'),
('2024-2025', '2024-08-01', '2025-05-31', TRUE, 'ACTIVE'),
('2025-2026', '2025-08-01', '2026-05-31', FALSE, 'UPCOMING'),
('2026-2027', '2026-08-01', '2027-05-31', FALSE, 'UPCOMING');

SET @default_ay_id = (SELECT id FROM academic_years WHERE is_current = TRUE LIMIT 1);
SET @default_ay_id = IFNULL(@default_ay_id, 1);

-- =========================================================================
-- 2. SEMESTERS: Multi-Year Scoping and Relaxing Single-Year Uniqueness
-- =========================================================================

SET @tbl_semesters = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'semesters');

-- Add academic_year_id column to semesters if absent
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'semesters' AND column_name = 'academic_year_id');
SET @sql = IF(@tbl_semesters = 1 AND @col_exists = 0, 'ALTER TABLE semesters ADD COLUMN academic_year_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop legacy unique constraint on semester_number if it exists (so semesters can repeat across academic years)
SET @drop_uq_sem = (
    SELECT IFNULL(
        (SELECT CONCAT('ALTER TABLE semesters DROP INDEX `', CONSTRAINT_NAME, '`')
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = @dbname
           AND TABLE_NAME = 'semesters'
           AND CONSTRAINT_TYPE = 'UNIQUE'
           AND CONSTRAINT_NAME LIKE '%semester_number%'
         LIMIT 1),
        'SELECT 1'
    )
);
PREPARE stmt FROM @drop_uq_sem; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Populate default academic_year_id for existing semesters
SET @sql = IF(@tbl_semesters = 1, CONCAT('UPDATE semesters SET academic_year_id = ', @default_ay_id, ' WHERE academic_year_id IS NULL'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index on semesters (academic_year_id, semester_number)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'semesters' AND index_name = 'idx_sem_ay_num');
SET @sql = IF(@tbl_semesters = 1 AND @idx_exists = 0, 'ALTER TABLE semesters ADD INDEX idx_sem_ay_num (academic_year_id, semester_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================================
-- 3. TIMETABLE SLOTS: Multi-Year & Semester Context Scoping
-- =========================================================================

SET @tbl_slots = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'timetable_slots');

-- Add academic_year_id to timetable_slots if absent
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'academic_year_id');
SET @sql = IF(@tbl_slots = 1 AND @col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN academic_year_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add semester_id to timetable_slots if absent
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'semester_id');
SET @sql = IF(@tbl_slots = 1 AND @col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN semester_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill timetable_slots academic_year_id
SET @sql = IF(@tbl_slots = 1, CONCAT('UPDATE timetable_slots SET academic_year_id = ', @default_ay_id, ' WHERE academic_year_id IS NULL'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add composite index on timetable_slots (dept_id, day_of_week, section)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND index_name = 'idx_ts_dept_day_sec');
SET @sql = IF(@tbl_slots = 1 AND @idx_exists = 0, 'ALTER TABLE timetable_slots ADD INDEX idx_ts_dept_day_sec (dept_id, day_of_week, section)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add composite index on timetable_slots (academic_year_id, semester_id, dept_id)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND index_name = 'idx_ts_ay_sem_dept');
SET @sql = IF(@tbl_slots = 1 AND @idx_exists = 0, 'ALTER TABLE timetable_slots ADD INDEX idx_ts_ay_sem_dept (academic_year_id, semester_id, dept_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================================
-- 4. STUDENT ACADEMICS: Multi-Year Context Scoping
-- =========================================================================

SET @tbl_sa = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'student_academics');

-- Add academic_year_id to student_academics if absent
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'student_academics' AND column_name = 'academic_year_id');
SET @sql = IF(@tbl_sa = 1 AND @col_exists = 0, 'ALTER TABLE student_academics ADD COLUMN academic_year_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill student_academics academic_year_id
SET @sql = IF(@tbl_sa = 1, CONCAT('UPDATE student_academics SET academic_year_id = ', @default_ay_id, ' WHERE academic_year_id IS NULL'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add composite index on student_academics (student_id, academic_year_id, semester)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'student_academics' AND index_name = 'idx_sa_student_ay_sem');
SET @sql = IF(@tbl_sa = 1 AND @idx_exists = 0, 'ALTER TABLE student_academics ADD INDEX idx_sa_student_ay_sem (student_id, academic_year_id, semester)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================================
-- 5. MARKS & ATTENDANCE: Create Tables if absent & Multi-Year Indexes
-- =========================================================================

CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    academic_year_id BIGINT NULL,
    semester INT NULL,
    cat1_score DECIMAL(5,2) NULL,
    cat2_score DECIMAL(5,2) NULL,
    cat3_score DECIMAL(5,2) NULL,
    assignment_score DECIMAL(5,2) NULL,
    attendance_percentage DECIMAL(5,2) NULL,
    calculated_internal DECIMAL(5,2) NULL,
    final_exam_score DECIMAL(5,2) NULL,
    final_converted_score DECIMAL(5,2) NULL,
    total_score DECIMAL(5,2) NULL,
    grade VARCHAR(10) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_marks_student_id (student_id),
    INDEX idx_marks_subject_id (subject_id),
    INDEX idx_marks_academic_year (academic_year_id),
    INDEX idx_marks_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    percentage DECIMAL(5,2) NULL,
    total_classes INT NULL,
    attended_classes INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_att_student_id (student_id),
    INDEX idx_att_subject_id (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @tbl_marks = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'marks');

-- Add academic_year_id to marks if absent
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'marks' AND column_name = 'academic_year_id');
SET @sql = IF(@tbl_marks = 1 AND @col_exists = 0, 'ALTER TABLE marks ADD COLUMN academic_year_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill marks academic_year_id
SET @sql = IF(@tbl_marks = 1, CONCAT('UPDATE marks SET academic_year_id = ', @default_ay_id, ' WHERE academic_year_id IS NULL'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index on marks for departmental aggregation: (subject_id, semester, total_score)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'marks' AND index_name = 'idx_marks_subj_sem_score');
SET @sql = IF(@tbl_marks = 1 AND @idx_exists = 0, 'ALTER TABLE marks ADD INDEX idx_marks_subj_sem_score (subject_id, semester, total_score)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================================
-- 6. STUDENTS & ATTENDANCE: High-Scale Composite Indexes
-- =========================================================================

SET @tbl_students = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'students');

-- Add composite index on students: (dept_id, year, section)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'students' AND index_name = 'idx_std_dept_yr_sec');
SET @sql = IF(@tbl_students = 1 AND @idx_exists = 0, 'ALTER TABLE students ADD INDEX idx_std_dept_yr_sec (dept_id, year, section)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add composite index on students: (batch, dept_id)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'students' AND index_name = 'idx_std_batch_dept');
SET @sql = IF(@tbl_students = 1 AND @idx_exists = 0, 'ALTER TABLE students ADD INDEX idx_std_batch_dept (batch, dept_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_att_records = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'attendance_records');

-- Add composite index on attendance_records: (student_subject_id, date, status)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'attendance_records' AND index_name = 'idx_att_rec_ssid_dt_st');
SET @sql = IF(@tbl_att_records = 1 AND @idx_exists = 0, 'ALTER TABLE attendance_records ADD INDEX idx_att_rec_ssid_dt_st (student_subject_id, date, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
