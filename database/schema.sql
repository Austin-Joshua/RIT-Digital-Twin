-- Digital Twin Smart Campus - Database Schema
-- Aligned with Hibernate entity definitions

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    dept_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    head_of_dept VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id BIGINT NOT NULL,
    dept_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- 4. Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    building_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL UNIQUE,
    total_floors INT NOT NULL,
    total_capacity INT,
    location_coordinates VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Classrooms Table
CREATE TABLE IF NOT EXISTS classrooms (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    building_id BIGINT NOT NULL,
    capacity INT NOT NULL,
    has_projector BOOLEAN DEFAULT FALSE,
    is_smart_classroom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE,
    UNIQUE(building_id, room_number),
    INDEX idx_room_capacity (capacity)
);

-- 6. Energy Logs Table
CREATE TABLE IF NOT EXISTS energy_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    energy_usage_kwh DECIMAL(10, 2) NOT NULL,
    solar_generated_kwh DECIMAL(10, 2) DEFAULT 0.00,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE,
    INDEX idx_energy_time (timestamp)
);

-- 7. Transport Routes Table
CREATE TABLE IF NOT EXISTS transport_routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_number VARCHAR(20) NOT NULL UNIQUE,
    route_name VARCHAR(100) NOT NULL,
    start_point VARCHAR(100),
    end_point VARCHAR(100),
    bus_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    coordinator_name VARCHAR(100),
    coordinator_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bus Stops Table
CREATE TABLE IF NOT EXISTS bus_stops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    pickup_time TIME,
    stop_order INT NOT NULL,
    landmark VARCHAR(255),
    student_count INT DEFAULT 0,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE
);

-- 9. Crowd Simulation Data
CREATE TABLE IF NOT EXISTS crowd_data (
    crowd_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    occupancy_count INT NOT NULL,
    congestion_level VARCHAR(20),
    evacuation_time_est_min INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE
);

-- 10. Simulation Results
CREATE TABLE IF NOT EXISTS simulation_results (
    sim_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sim_type VARCHAR(50) NOT NULL,
    simulation_name VARCHAR(255),
    parameters_json TEXT,
    result_json TEXT,
    summary TEXT,
    execution_time_ms BIGINT,
    status VARCHAR(50),
    started_at DATETIME,
    completed_at DATETIME,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 11. Sustainability Metrics
CREATE TABLE IF NOT EXISTS sustainability_metrics (
    metric_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    energy_score DECIMAL(5, 2),
    transport_score DECIMAL(5, 2),
    waste_management_score DECIMAL(5, 2),
    composite_index DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marks Table
CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    semester INT,
    cat1_score DECIMAL(5, 2),
    cat2_score DECIMAL(5, 2),
    cat3_score DECIMAL(5, 2),
    assignment_score DECIMAL(5, 2),
    attendance_percentage DECIMAL(5, 2),
    calculated_internal DECIMAL(5, 2),
    final_exam_score DECIMAL(5, 2),
    final_converted_score DECIMAL(5, 2),
    total_score DECIMAL(5, 2),
    grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Mark History Table (Audit Log)
CREATE TABLE IF NOT EXISTS mark_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mark_id BIGINT NOT NULL,
    field_name VARCHAR(50),
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mark_id) REFERENCES marks(id) ON DELETE CASCADE
);

-- Timetable Table
CREATE TABLE IF NOT EXISTS timetables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(200),
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_name VARCHAR(200),
    department_id BIGINT,
    classroom_id BIGINT,
    FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE SET NULL,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(room_id) ON DELETE SET NULL
);

-- Data Seeding
INSERT IGNORE INTO roles (role_name) VALUES ('ADMIN'), ('MANAGEMENT'), ('FACULTY'), ('STUDENT');
INSERT IGNORE INTO departments (dept_name) VALUES ('Computer Science'), ('Mechanical'), ('Civil'), ('Electronics');

SET FOREIGN_KEY_CHECKS = 1;
