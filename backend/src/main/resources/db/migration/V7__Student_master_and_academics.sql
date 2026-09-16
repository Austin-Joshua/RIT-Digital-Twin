-- Student master and academics expansion for CSE-A onboarding

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'register_no'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE students ADD COLUMN register_no VARCHAR(30) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'student_name'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE students ADD COLUMN student_name VARCHAR(150) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'batch_label'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE students ADD COLUMN batch_label VARCHAR(30) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'scholar_type'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE students ADD COLUMN scholar_type VARCHAR(30) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'contact_email'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE students ADD COLUMN contact_email VARCHAR(120) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'phone'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE students ADD COLUMN phone VARCHAR(20) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'status'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE students ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''active''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'students' AND index_name = 'uq_students_register_no'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE UNIQUE INDEX uq_students_register_no ON students(register_no)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'users'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'linked_student_id'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN linked_student_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'users'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'account_status'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT ''active''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'users'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'force_password_change'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN force_password_change BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'users'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'last_login'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE users ADD COLUMN last_login DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- Add FK only when missing
SET @users_tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'users'
);
SET @students_tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND constraint_name = 'fk_users_linked_student'
);
SET @fk_sql = IF(
    @users_tbl_exists = 1 AND @students_tbl_exists = 1 AND @fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_linked_student FOREIGN KEY (linked_student_id) REFERENCES students(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt FROM @fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS semesters (
    semester_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_number INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'subjects'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'subjects' AND column_name = 'semester_id'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE subjects ADD COLUMN semester_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'subjects'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'subjects' AND column_name = 'department_name'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE subjects ADD COLUMN department_name VARCHAR(120) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


SET @subjects_tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'subjects'
);
SET @semesters_tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'semesters'
);
SET @subject_fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND constraint_name = 'fk_subject_semester'
);
SET @subject_fk_sql = IF(
    @subjects_tbl_exists = 1 AND @semesters_tbl_exists = 1 AND @subject_fk_exists = 0,
    'ALTER TABLE subjects ADD CONSTRAINT fk_subject_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt2 FROM @subject_fk_sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

CREATE TABLE IF NOT EXISTS grades (
    grade_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    internal_marks DECIMAL(5,2) NOT NULL,
    external_marks DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    grade_letter VARCHAR(5) NOT NULL,
    grade_points DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    CONSTRAINT uq_grades_student_subject_sem UNIQUE (student_id, subject_id, semester_id)
);


CREATE TABLE IF NOT EXISTS student_academics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    semester INT NOT NULL,
    gpa DECIMAL(4,2) NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_academics_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_academics_student_sem UNIQUE (student_id, semester)
);


INSERT INTO semesters (semester_number)
VALUES (1), (2)
ON DUPLICATE KEY UPDATE semester_number = VALUES(semester_number);
