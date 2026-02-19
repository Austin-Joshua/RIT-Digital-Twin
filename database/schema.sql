-- Digital Twin Smart Campus - Database Schema
-- Fully Normalized, Indexed, and Constraint-Rich

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE, -- ADMIN, MANAGEMENT, FACULTY
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    dept_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    head_of_dept VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
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
    location_coordinates VARCHAR(100), -- Lat,Long
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

-- 6. Energy Logs Table (Energy Optimization Module)
CREATE TABLE IF NOT EXISTS energy_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    energy_usage_kwh DECIMAL(10, 2) NOT NULL,
    solar_generated_kwh DECIMAL(10, 2) DEFAULT 0.00,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE,
    INDEX idx_energy_time (timestamp)
);

-- 7. Transport Routes Table (Transport Module)
CREATE TABLE IF NOT EXISTS transport_routes (
    route_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    driver_name VARCHAR(100),
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    fuel_efficiency_kmpl DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bus Stops Table
CREATE TABLE IF NOT EXISTS bus_stops (
    stop_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    student_count INT DEFAULT 0,
    arrival_time TIME,
    FOREIGN KEY (route_id) REFERENCES transport_routes(route_id) ON DELETE CASCADE
);

-- 9. Crowd Simulation Data (Crowd Flow Module)
CREATE TABLE IF NOT EXISTS crowd_data (
    crowd_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    occupancy_count INT NOT NULL,
    congestion_level VARCHAR(20), -- LOW, MEDIUM, HIGH, CRITICAL
    evacuation_time_est_min INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE
);

-- 10. Simulation Results (General Purpose for Allocations)
CREATE TABLE IF NOT EXISTS simulation_results (
    sim_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sim_type VARCHAR(50) NOT NULL, -- CLASSROOM, ENERGY, TRANSPORT
    parameters_json TEXT, -- Input parameters
    result_json TEXT, -- Output results
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 11. Sustainability Metrics (Composite Index)
CREATE TABLE IF NOT EXISTS sustainability_metrics (
    metric_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    energy_score DECIMAL(5, 2),
    transport_score DECIMAL(5, 2),
    waste_management_score DECIMAL(5, 2),
    composite_index DECIMAL(5, 2), -- The final calculated score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Seeding (Initial Data)
INSERT IGNORE INTO roles (role_name) VALUES ('ADMIN'), ('MANAGEMENT'), ('FACULTY');
INSERT IGNORE INTO departments (dept_name) VALUES ('Computer Science'), ('Mechanical'), ('Civil'), ('Electronics');

SET FOREIGN_KEY_CHECKS = 1;
