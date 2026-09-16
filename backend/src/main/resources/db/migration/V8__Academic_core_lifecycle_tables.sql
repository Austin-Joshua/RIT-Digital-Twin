-- ERP academic lifecycle core tables

CREATE TABLE IF NOT EXISTS curriculum (
    curriculum_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(120) NOT NULL,
    regulation_year INT NOT NULL,
    batch_range VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_curriculum UNIQUE (department, regulation_year, batch_range)
);

CREATE TABLE IF NOT EXISTS sections (
    section_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_name VARCHAR(40) NOT NULL UNIQUE,
    department VARCHAR(120) NOT NULL,
    batch_range VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_subjects (
    student_subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_subjects_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_subjects_sem FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_subject UNIQUE (student_id, subject_id, semester_id)
);


CREATE TABLE IF NOT EXISTS faculty_profiles (
    faculty_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(40) UNIQUE,
    department VARCHAR(120),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS faculty_subjects (
    faculty_subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    section VARCHAR(40) NOT NULL,
    semester_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fac_sub_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id) ON DELETE CASCADE,
    CONSTRAINT fk_fac_sub_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_fac_sub_sem FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    CONSTRAINT uq_fac_sub UNIQUE (faculty_id, subject_id, section, semester_id)
);


CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_subject_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    recorded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_record_student_subject FOREIGN KEY (student_subject_id) REFERENCES student_subjects(student_subject_id) ON DELETE CASCADE,
    CONSTRAINT fk_att_record_user FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT uq_attendance_day UNIQUE (student_subject_id, date)
);


CREATE TABLE IF NOT EXISTS internal_marks (
    internal_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_subject_id BIGINT NOT NULL UNIQUE,
    cat1_marks DECIMAL(5,2) DEFAULT 0,
    cat2_marks DECIMAL(5,2) DEFAULT 0,
    cat3_marks DECIMAL(5,2) DEFAULT 0,
    assignment_marks DECIMAL(5,2) DEFAULT 0,
    attendance_marks DECIMAL(5,2) DEFAULT 0,
    total_internal DECIMAL(5,2) DEFAULT 0,
    updated_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_internal_student_subject FOREIGN KEY (student_subject_id) REFERENCES student_subjects(student_subject_id) ON DELETE CASCADE,
    CONSTRAINT fk_internal_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exams (
    exam_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    name VARCHAR(120) NOT NULL,
    exam_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_sem FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE
);


SET @students_tbl_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'students'
);
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'students'
      AND column_name = 'curriculum_id'
);
SET @sql = IF(
    @students_tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE students ADD COLUMN curriculum_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt5 FROM @sql;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

SET @students_tbl_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'students'
);
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'students'
      AND column_name = 'current_semester'
);
SET @sql = IF(
    @students_tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE students ADD COLUMN current_semester INT NULL',
    'SELECT 1'
);
PREPARE stmt6 FROM @sql;
EXECUTE stmt6;
DEALLOCATE PREPARE stmt6;


SET @curriculum_tbl_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'curriculum'
);
SET @student_curr_fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND constraint_name = 'fk_students_curriculum'
);
SET @student_curr_fk_sql = IF(
    @students_tbl_exists = 1 AND @curriculum_tbl_exists = 1 AND @student_curr_fk_exists = 0,
    'ALTER TABLE students ADD CONSTRAINT fk_students_curriculum FOREIGN KEY (curriculum_id) REFERENCES curriculum(curriculum_id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt3 FROM @student_curr_fk_sql;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

SET @semesters_tbl_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'semesters'
);
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'semesters'
      AND column_name = 'curriculum_id'
);
SET @sql = IF(
    @semesters_tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE semesters ADD COLUMN curriculum_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt7 FROM @sql;
EXECUTE stmt7;
DEALLOCATE PREPARE stmt7;

SET @semesters_tbl_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'semesters'
);
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'semesters'
      AND column_name = 'academic_year'
);
SET @sql = IF(
    @semesters_tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE semesters ADD COLUMN academic_year VARCHAR(30) NULL',
    'SELECT 1'
);
PREPARE stmt8 FROM @sql;
EXECUTE stmt8;
DEALLOCATE PREPARE stmt8;

SET @sem_curr_fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND constraint_name = 'fk_semesters_curriculum'
);
SET @sem_curr_fk_sql = IF(
    @semesters_tbl_exists = 1 AND @curriculum_tbl_exists = 1 AND @sem_curr_fk_exists = 0,
    'ALTER TABLE semesters ADD CONSTRAINT fk_semesters_curriculum FOREIGN KEY (curriculum_id) REFERENCES curriculum(curriculum_id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt4 FROM @sem_curr_fk_sql;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;
