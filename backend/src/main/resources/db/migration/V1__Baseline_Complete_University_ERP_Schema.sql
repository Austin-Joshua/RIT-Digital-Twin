-- Flyway Migration V1: Complete Baseline Schema for RIT Digital Twin ERP
-- Unified single database structure containing all required tables, constraints, indexes, and schema definitions.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    dept_name VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role_id INT NOT NULL,
    dept_id BIGINT,
    account_status VARCHAR(20) DEFAULT 'active',
    must_change_password BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    lock_until DATETIME,
    last_login DATETIME,
    last_password_change DATETIME,
    linked_student_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id),
    CONSTRAINT fk_users_dept FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Students
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    register_no VARCHAR(50) NOT NULL UNIQUE,
    student_id_number VARCHAR(50) UNIQUE,
    student_name VARCHAR(150) NOT NULL,
    section VARCHAR(20),
    batch VARCHAR(20),
    year INT DEFAULT 1,
    current_semester INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    dept_id BIGINT,
    scholar_type VARCHAR(50) DEFAULT 'Day Scholar',
    email VARCHAR(150),
    phone VARCHAR(20),
    current_cgpa DECIMAL(4,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_students_dept FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_students_reg_no (register_no),
    INDEX idx_students_email (email),
    INDEX idx_students_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add User to StudentFK linkage if missing
ALTER TABLE users ADD CONSTRAINT fk_users_linked_student FOREIGN KEY (linked_student_id) REFERENCES students(id) ON DELETE SET NULL;

-- 5. Parents
CREATE TABLE IF NOT EXISTS parents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    student_id BIGINT,
    name VARCHAR(150),
    relationship VARCHAR(50) DEFAULT 'Parent',
    contact_info VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_parents_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_parents_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100) DEFAULT 'Assistant Professor',
    specialization VARCHAR(150),
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Semesters
CREATE TABLE IF NOT EXISTS semesters (
    semester_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_number INT NOT NULL UNIQUE,
    academic_year VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL UNIQUE,
    subject_name VARCHAR(150) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    department_id BIGINT,
    department_name VARCHAR(150),
    semester_id BIGINT,
    regulation VARCHAR(20) DEFAULT 'R2024',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subjects_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_subjects_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Student Subjects Mapping
CREATE TABLE IF NOT EXISTS student_subjects (
    student_subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_subject_sem UNIQUE (student_id, subject_id, semester_id),
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_subject_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Present',
    recorded_by BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_day UNIQUE (student_subject_id, date),
    CONSTRAINT fk_ar_student_subject FOREIGN KEY (student_subject_id) REFERENCES student_subjects(student_subject_id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Grades & Performance
CREATE TABLE IF NOT EXISTS grades (
    grade_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    internal_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    external_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    grade_letter VARCHAR(5) NOT NULL DEFAULT 'F',
    grade_points DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_subject_sem_grade UNIQUE (student_id, subject_id, semester_id),
    CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Student Academic Metrics
CREATE TABLE IF NOT EXISTS student_academics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    semester INT NOT NULL,
    gpa DECIMAL(4,2) DEFAULT 0.00,
    cgpa DECIMAL(4,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_academic_sem UNIQUE (student_id, semester),
    CONSTRAINT fk_academic_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Buildings & Spatial Digital Twin
CREATE TABLE IF NOT EXISTS buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(150),
    total_capacity INT DEFAULT 500,
    base_energy_load DECIMAL(10,2) DEFAULT 100.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS classrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    building_id BIGINT NOT NULL,
    capacity INT DEFAULT 60,
    type VARCHAR(50) DEFAULT 'Lecture Hall',
    peak_load_multiplier DECIMAL(4,2) DEFAULT 1.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_classroom_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Timetable Slots
CREATE TABLE IF NOT EXISTS timetable_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_code VARCHAR(50) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    faculty_username VARCHAR(100),
    day_of_week VARCHAR(20) NOT NULL,
    slot_index INT NOT NULL,
    start_time TIME,
    end_time TIME,
    classroom_id BIGINT,
    semester_number INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_slot_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
    INDEX idx_timetable_section (section_code),
    INDEX idx_timetable_faculty (faculty_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Security & Refresh Token Tables
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    device_info VARCHAR(500),
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    affected_user_id BIGINT,
    ip_address VARCHAR(50),
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Core Roles
INSERT IGNORE INTO roles (role_id, role_name) VALUES (1, 'ADMIN'), (2, 'HOD'), (3, 'FACULTY'), (4, 'STUDENT'), (5, 'PARENT');

-- Seed Core Departments
INSERT IGNORE INTO departments (id, code, dept_name) VALUES (1, 'CSE', 'B.E. Computer Science and Engineering'), (2, 'CSBS', 'B.Tech Computer Science and Business Systems');

SET FOREIGN_KEY_CHECKS = 1;
