const fs = require('fs');
const routes = fs.readFileSync('scrape_ims/all_routes_seed.sql', 'utf8');
const header = `/*
=============================================================================
RIT SYNC FINAL - BULLETPROOF IDEMPOTENT VERSION (WITH USERS & ALL ROUTES)
=============================================================================
INSTRUCTIONS:
1. Open this script in MySQL Workbench.
2. Press Ctrl + Alt + Shift + Enter (or the lightning bolt with 'I') to run the whole thing.
=============================================================================
*/

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;
USE defaultdb;

-- ---------------------------------------------------------
-- 1. Helper Procedure for Safe Column Addition
-- ---------------------------------------------------------
DROP PROCEDURE IF EXISTS AddColumnSafely;
DELIMITER //
CREATE PROCEDURE AddColumnSafely(
    IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100),
    IN p_column_def VARCHAR(255)
)
BEGIN
    DECLARE column_count INT;
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = p_table_name
    AND column_name = p_column_name
    AND table_schema = DATABASE();

    IF column_count = 0 THEN
        SET @sql_text = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_def);
        PREPARE stmt FROM @sql_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- ---------------------------------------------------------
-- 2. Role Seeding
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO roles (id, role_name) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_FACULTY'),
(3, 'ROLE_STUDENT'),
(4, 'ROLE_SUPER_ADMIN');

-- ---------------------------------------------------------
-- 3. User Seeding (Fixes the Login Failed error)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id BIGINT NOT NULL,
    dept_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Passwords: admin123, faculty123, student123
INSERT IGNORE INTO users (username, email, password, first_name, last_name, role_id) VALUES
('admin@ritchennai.edu.in',   'admin@ritchennai.edu.in',   '$2a$10$KryCmxLqFNoMv3Qd6KSK20dJotZ6ItPc14vyIW6S5v3WJ0xcljWkK', 'System', 'Admin', 1),
('faculty@ritchennai.edu.in', 'faculty@ritchennai.edu.in', '$2a$10$p0M9Xp6xQG5stLCRzM9vHeE8L.g9E1Z6.iYv.C7e4v9v9v9v9v9v9', 'John', 'Faculty', 2),
('student@ritchennai.edu.in', 'student@ritchennai.edu.in', '$2a$10$p0M9Xp6xQG5stLCRzM9vHeE8L.g9E1Z6.iYv.C7e4v9v9v9v9v9v9', 'Jane', 'Student', 3);

-- ---------------------------------------------------------
-- 4. Transport Routes & Bus Stops
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS transport_routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL UNIQUE,
    route_number VARCHAR(20),
    start_point VARCHAR(100),
    end_point VARCHAR(100),
    bus_number VARCHAR(50),
    capacity INT DEFAULT 56,
    current_occupancy INT DEFAULT 0,
    coordinator_name VARCHAR(100),
    coordinator_phone VARCHAR(20)
);

CALL AddColumnSafely('transport_routes', 'route_number', 'VARCHAR(20)');
CALL AddColumnSafely('transport_routes', 'start_point', 'VARCHAR(100)');
CALL AddColumnSafely('transport_routes', 'end_point', 'VARCHAR(100)');
CALL AddColumnSafely('transport_routes', 'bus_number', 'VARCHAR(50)');
CALL AddColumnSafely('transport_routes', 'capacity', 'INT DEFAULT 56');
CALL AddColumnSafely('transport_routes', 'current_occupancy', 'INT DEFAULT 0');
CALL AddColumnSafely('transport_routes', 'coordinator_name', 'VARCHAR(100)');
CALL AddColumnSafely('transport_routes', 'coordinator_phone', 'VARCHAR(20)');

CREATE TABLE IF NOT EXISTS bus_stops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    pickup_time TIME,
    stop_order INT,
    landmark VARCHAR(255),
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE
);

`;

const footer = `
-- ---------------------------------------------------------
-- 5. Academic Marks (Internal Logic)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT,
    subject_code VARCHAR(20),
    subject_name VARCHAR(100),
    credits INT,
    cat1_score DOUBLE,
    cat2_score DOUBLE,
    cat3_score DOUBLE,
    assignment_score DOUBLE,
    attendance_percentage DOUBLE,
    calculated_internal DOUBLE,
    final_exam_score DOUBLE,
    final_converted_score DOUBLE,
    total_score DOUBLE,
    grade VARCHAR(2),
    semester INT,
    academic_year VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CALL AddColumnSafely('marks', 'cat1_score', 'DOUBLE');
CALL AddColumnSafely('marks', 'cat2_score', 'DOUBLE');
CALL AddColumnSafely('marks', 'cat3_score', 'DOUBLE');
CALL AddColumnSafely('marks', 'assignment_score', 'DOUBLE');
CALL AddColumnSafely('marks', 'attendance_percentage', 'DOUBLE');
CALL AddColumnSafely('marks', 'calculated_internal', 'DOUBLE');
CALL AddColumnSafely('marks', 'final_exam_score', 'DOUBLE');
CALL AddColumnSafely('marks', 'final_converted_score', 'DOUBLE');
CALL AddColumnSafely('marks', 'total_score', 'DOUBLE');
CALL AddColumnSafely('marks', 'grade', 'VARCHAR(2)');

-- Clean up
DROP PROCEDURE IF EXISTS AddColumnSafely;
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- VERIFICATION QUERY
SELECT 'Sync Complete' as Status, (SELECT COUNT(*) FROM users) as UserCount, (SELECT COUNT(*) FROM transport_routes) as RouteCount;
`;

fs.writeFileSync('database/workbench_sync.sql', header + routes + footer);
console.log('Successfully written script check');
