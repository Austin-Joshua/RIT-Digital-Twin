-- =====================================================
-- RIT Digital Twin – Smart Campus Intelligence Platform
-- Complete Database Schema
-- Rajalakshmi Institute of Technology, Chennai
-- =====================================================

CREATE DATABASE IF NOT EXISTS rit_digital_twin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rit_digital_twin;

-- =====================================================
-- 1. ROLES
-- Lookup table for user roles (normalized from enum)
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(30)  NOT NULL UNIQUE COMMENT 'ADMIN, MANAGEMENT, FACULTY',
    description VARCHAR(255) NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (name, description) VALUES
    ('ADMIN',      'System administrator with full access'),
    ('MANAGEMENT', 'College management with analytics and reporting access'),
    ('FACULTY',    'Faculty members with classroom and schedule access');

-- =====================================================
-- 2. USERS
-- All platform users with role-based access
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed',
    full_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NULL,
    role_id     INT          NOT NULL,
    department_id BIGINT     NULL COMMENT 'FK added after departments table',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login  TIMESTAMP    NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    INDEX idx_role_id (role_id),
    INDEX idx_is_active (is_active),
    INDEX idx_full_name (full_name),

    CONSTRAINT fk_users_role FOREIGN KEY (role_id)
        REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- 3. BUILDINGS
-- Campus building inventory
-- =====================================================
CREATE TABLE IF NOT EXISTS buildings (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  NOT NULL COMMENT 'Short code e.g. MB, AB1, LH',
    total_floors    INT          NOT NULL DEFAULT 1,
    total_area_sqft DECIMAL(10,2) NULL,
    latitude        DECIMAL(10,8) NULL,
    longitude       DECIMAL(11,8) NULL,
    year_built      INT          NULL,
    building_type   ENUM('ACADEMIC','ADMINISTRATIVE','HOSTEL','LIBRARY','LAB','SPORTS','CANTEEN','OTHER')
                    NOT NULL DEFAULT 'ACADEMIC',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_building_code (code),
    INDEX idx_building_type (building_type),
    INDEX idx_building_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 4. DEPARTMENTS
-- Academic departments
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  NOT NULL COMMENT 'CSE, ECE, MECH, EEE, etc.',
    building_id     BIGINT       NULL,
    hod_user_id     BIGINT       NULL COMMENT 'Head of Department',
    total_faculty   INT          NOT NULL DEFAULT 0,
    total_students  INT          NOT NULL DEFAULT 0,
    established_year INT         NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_dept_code (code),
    INDEX idx_dept_building (building_id),
    INDEX idx_dept_active (is_active),

    CONSTRAINT fk_dept_building FOREIGN KEY (building_id)
        REFERENCES buildings(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_dept_hod FOREIGN KEY (hod_user_id)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Add deferred FK from users → departments
ALTER TABLE users
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id)
        REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- =====================================================
-- 5. CLASSROOMS
-- Room inventory linked to buildings
-- =====================================================
CREATE TABLE IF NOT EXISTS classrooms (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number     VARCHAR(20)  NOT NULL,
    building_id     BIGINT       NOT NULL,
    floor           INT          NOT NULL DEFAULT 0,
    capacity        INT          NOT NULL DEFAULT 60,
    room_type       ENUM('LECTURE_HALL','LAB','SEMINAR','TUTORIAL','AUDITORIUM','CONFERENCE')
                    NOT NULL DEFAULT 'LECTURE_HALL',
    has_projector   BOOLEAN      NOT NULL DEFAULT TRUE,
    has_ac          BOOLEAN      NOT NULL DEFAULT FALSE,
    has_smart_board BOOLEAN      NOT NULL DEFAULT FALSE,
    has_wifi        BOOLEAN      NOT NULL DEFAULT TRUE,
    area_sqft       DECIMAL(8,2) NULL,
    is_available    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_room_building (room_number, building_id),
    INDEX idx_building_id (building_id),
    INDEX idx_room_type (room_type),
    INDEX idx_capacity (capacity),
    INDEX idx_available (is_available),
    INDEX idx_floor (floor),

    CONSTRAINT fk_classroom_building FOREIGN KEY (building_id)
        REFERENCES buildings(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 6. TIMETABLES
-- Class scheduling (Smart Classroom Allocation)
-- =====================================================
CREATE TABLE IF NOT EXISTS timetables (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    classroom_id    BIGINT       NOT NULL,
    department_id   BIGINT       NOT NULL,
    faculty_id      BIGINT       NULL,
    subject_name    VARCHAR(100) NOT NULL,
    subject_code    VARCHAR(20)  NULL,
    day_of_week     ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY')
                    NOT NULL,
    start_time      TIME         NOT NULL,
    end_time        TIME         NOT NULL,
    semester        INT          NOT NULL COMMENT '1-8',
    section         VARCHAR(5)   NULL COMMENT 'A, B, C etc.',
    academic_year   VARCHAR(9)   NOT NULL COMMENT '2024-2025',
    student_count   INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tt_classroom (classroom_id),
    INDEX idx_tt_department (department_id),
    INDEX idx_tt_faculty (faculty_id),
    INDEX idx_tt_day (day_of_week),
    INDEX idx_tt_schedule (day_of_week, start_time, end_time),
    INDEX idx_tt_semester (semester, academic_year),
    INDEX idx_tt_active (is_active),

    CONSTRAINT fk_tt_classroom FOREIGN KEY (classroom_id)
        REFERENCES classrooms(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_tt_department FOREIGN KEY (department_id)
        REFERENCES departments(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_tt_faculty FOREIGN KEY (faculty_id)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_tt_time CHECK (end_time > start_time),
    CONSTRAINT chk_tt_semester CHECK (semester BETWEEN 1 AND 8)
) ENGINE=InnoDB;

-- =====================================================
-- 7. ENERGY_LOGS
-- Energy consumption readings per building
-- =====================================================
CREATE TABLE IF NOT EXISTS energy_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id     BIGINT       NOT NULL,
    reading_date    DATE         NOT NULL,
    reading_hour    INT          NOT NULL COMMENT '0-23',
    consumption_kwh DECIMAL(12,4) NOT NULL DEFAULT 0,
    solar_generation_kwh DECIMAL(12,4) NOT NULL DEFAULT 0,
    peak_demand_kw  DECIMAL(10,4) NULL,
    temperature_c   DECIMAL(5,2) NULL COMMENT 'Ambient temp at reading time',
    hvac_usage_kwh  DECIMAL(10,4) NULL,
    lighting_kwh    DECIMAL(10,4) NULL,
    equipment_kwh   DECIMAL(10,4) NULL,
    source          ENUM('SENSOR','MANUAL','SIMULATED') NOT NULL DEFAULT 'SENSOR',
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_el_building (building_id),
    INDEX idx_el_date (reading_date),
    INDEX idx_el_building_date (building_id, reading_date),
    INDEX idx_el_hour (reading_hour),
    INDEX idx_el_source (source),

    CONSTRAINT fk_el_building FOREIGN KEY (building_id)
        REFERENCES buildings(id) ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT chk_el_hour CHECK (reading_hour BETWEEN 0 AND 23),
    CONSTRAINT chk_el_consumption CHECK (consumption_kwh >= 0),
    CONSTRAINT chk_el_solar CHECK (solar_generation_kwh >= 0)
) ENGINE=InnoDB;

-- =====================================================
-- 8. TRANSPORT_ROUTES
-- Campus bus/shuttle routes
-- =====================================================
CREATE TABLE IF NOT EXISTS transport_routes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_number    VARCHAR(20)  NOT NULL,
    route_name      VARCHAR(100) NOT NULL,
    origin          VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    total_distance_km DECIMAL(8,2) NULL,
    estimated_duration_min INT NULL,
    vehicle_type    ENUM('BUS','MINIBUS','VAN','SHUTTLE') NOT NULL DEFAULT 'BUS',
    vehicle_capacity INT        NOT NULL DEFAULT 50,
    departure_time  TIME         NOT NULL,
    arrival_time    TIME         NOT NULL,
    route_type      ENUM('MORNING','EVENING','SPECIAL') NOT NULL DEFAULT 'MORNING',
    driver_name     VARCHAR(100) NULL,
    driver_phone    VARCHAR(20)  NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_route_number (route_number),
    INDEX idx_tr_type (route_type),
    INDEX idx_tr_vehicle (vehicle_type),
    INDEX idx_tr_active (is_active),
    INDEX idx_tr_departure (departure_time)
) ENGINE=InnoDB;

-- =====================================================
-- 9. BUS_STOPS
-- Stops along transport routes
-- =====================================================
CREATE TABLE IF NOT EXISTS bus_stops (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id        BIGINT       NOT NULL,
    stop_name       VARCHAR(100) NOT NULL,
    stop_order      INT          NOT NULL COMMENT 'Sequence in route',
    latitude        DECIMAL(10,8) NULL,
    longitude       DECIMAL(11,8) NULL,
    estimated_arrival_offset_min INT NOT NULL DEFAULT 0 COMMENT 'Minutes from departure',
    passenger_count_avg INT      NULL COMMENT 'Average daily boarding',
    landmark        VARCHAR(200) NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_bs_route (route_id),
    INDEX idx_bs_order (route_id, stop_order),

    CONSTRAINT fk_bs_route FOREIGN KEY (route_id)
        REFERENCES transport_routes(id) ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT chk_bs_order CHECK (stop_order > 0)
) ENGINE=InnoDB;

-- =====================================================
-- 10. CROWD_DATA
-- Real-time and historical crowd density readings
-- =====================================================
CREATE TABLE IF NOT EXISTS crowd_data (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id     BIGINT       NULL,
    zone_name       VARCHAR(100) NOT NULL COMMENT 'Gate, Canteen, Library, etc.',
    recorded_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    person_count    INT          NOT NULL DEFAULT 0,
    density_level   ENUM('LOW','MODERATE','HIGH','CRITICAL') NOT NULL DEFAULT 'LOW',
    max_capacity    INT          NOT NULL DEFAULT 500,
    occupancy_pct   DECIMAL(5,2) GENERATED ALWAYS AS (
                        CASE WHEN max_capacity > 0 THEN (person_count / max_capacity) * 100 ELSE 0 END
                    ) STORED,
    is_emergency    BOOLEAN      NOT NULL DEFAULT FALSE,
    alert_triggered BOOLEAN      NOT NULL DEFAULT FALSE,
    source          ENUM('SENSOR','CAMERA','MANUAL','SIMULATED') NOT NULL DEFAULT 'SENSOR',
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_cd_building (building_id),
    INDEX idx_cd_zone (zone_name),
    INDEX idx_cd_recorded (recorded_at),
    INDEX idx_cd_density (density_level),
    INDEX idx_cd_emergency (is_emergency),
    INDEX idx_cd_building_time (building_id, recorded_at),

    CONSTRAINT fk_cd_building FOREIGN KEY (building_id)
        REFERENCES buildings(id) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_cd_count CHECK (person_count >= 0),
    CONSTRAINT chk_cd_capacity CHECK (max_capacity > 0)
) ENGINE=InnoDB;

-- =====================================================
-- 11. SIMULATION_RESULTS
-- Output storage for all simulation engines
-- =====================================================
CREATE TABLE IF NOT EXISTS simulation_results (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    simulation_type ENUM('CLASSROOM_ALLOCATION','ENERGY_FORECAST','TRANSPORT_OPTIMIZATION',
                         'CROWD_EVACUATION','SUSTAINABILITY_PROJECTION','PREDICTIVE_ANALYTICS')
                    NOT NULL,
    simulation_name VARCHAR(150) NOT NULL,
    run_by_user_id  BIGINT       NULL,
    parameters      JSON         NOT NULL COMMENT 'Input parameters as JSON',
    results         JSON         NOT NULL COMMENT 'Output results as JSON',
    summary         TEXT         NULL COMMENT 'Human-readable summary',
    accuracy_score  DECIMAL(5,2) NULL COMMENT 'Model accuracy percentage',
    execution_time_ms BIGINT    NULL COMMENT 'Runtime in milliseconds',
    status          ENUM('PENDING','RUNNING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
    error_message   TEXT         NULL,
    started_at      TIMESTAMP    NULL,
    completed_at    TIMESTAMP    NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_sr_type (simulation_type),
    INDEX idx_sr_status (status),
    INDEX idx_sr_user (run_by_user_id),
    INDEX idx_sr_created (created_at),
    INDEX idx_sr_type_status (simulation_type, status),

    CONSTRAINT fk_sr_user FOREIGN KEY (run_by_user_id)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- 12. SUSTAINABILITY_METRICS
-- Environmental and sustainability KPIs
-- =====================================================
CREATE TABLE IF NOT EXISTS sustainability_metrics (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_date          DATE         NOT NULL,
    building_id          BIGINT       NULL COMMENT 'NULL = campus-wide',
    carbon_emission_kg   DECIMAL(12,4) NOT NULL DEFAULT 0,
    carbon_offset_kg     DECIMAL(12,4) NOT NULL DEFAULT 0,
    water_usage_liters   DECIMAL(14,2) NOT NULL DEFAULT 0,
    water_recycled_liters DECIMAL(14,2) NOT NULL DEFAULT 0,
    waste_generated_kg   DECIMAL(10,2) NOT NULL DEFAULT 0,
    waste_recycled_kg    DECIMAL(10,2) NOT NULL DEFAULT 0,
    solar_energy_kwh     DECIMAL(12,4) NOT NULL DEFAULT 0,
    green_cover_sqft     DECIMAL(10,2) NULL,
    air_quality_index    INT          NULL COMMENT 'AQI value',
    sustainability_score DECIMAL(5,2) NULL COMMENT '0-100 composite score',
    sdg_alignment        JSON         NULL COMMENT 'UN SDG goals alignment data',
    source               ENUM('MEASURED','CALCULATED','PROJECTED') NOT NULL DEFAULT 'MEASURED',
    created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_sm_date_building (metric_date, building_id),
    INDEX idx_sm_date (metric_date),
    INDEX idx_sm_building (building_id),
    INDEX idx_sm_score (sustainability_score),
    INDEX idx_sm_source (source),

    CONSTRAINT fk_sm_building FOREIGN KEY (building_id)
        REFERENCES buildings(id) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_sm_carbon CHECK (carbon_emission_kg >= 0),
    CONSTRAINT chk_sm_water CHECK (water_usage_liters >= 0),
    CONSTRAINT chk_sm_waste CHECK (waste_generated_kg >= 0),
    CONSTRAINT chk_sm_score CHECK (sustainability_score IS NULL OR sustainability_score BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- =====================================================
-- VIEWS for common queries
-- =====================================================

-- Active classroom utilization
CREATE OR REPLACE VIEW v_classroom_utilization AS
SELECT
    c.id AS classroom_id,
    c.room_number,
    b.name AS building_name,
    b.code AS building_code,
    c.capacity,
    c.room_type,
    COUNT(t.id) AS scheduled_slots,
    ROUND(COUNT(t.id) / 36.0 * 100, 1) AS utilization_pct
FROM classrooms c
JOIN buildings b ON c.building_id = b.id
LEFT JOIN timetables t ON t.classroom_id = c.id AND t.is_active = TRUE
WHERE c.is_available = TRUE
GROUP BY c.id, c.room_number, b.name, b.code, c.capacity, c.room_type;

-- Building energy summary (daily)
CREATE OR REPLACE VIEW v_building_energy_daily AS
SELECT
    b.id AS building_id,
    b.name AS building_name,
    b.code AS building_code,
    el.reading_date,
    SUM(el.consumption_kwh) AS total_consumption_kwh,
    SUM(el.solar_generation_kwh) AS total_solar_kwh,
    MAX(el.peak_demand_kw) AS peak_demand_kw,
    AVG(el.temperature_c) AS avg_temperature_c
FROM buildings b
JOIN energy_logs el ON el.building_id = b.id
GROUP BY b.id, b.name, b.code, el.reading_date;

-- Route overview with stop count
CREATE OR REPLACE VIEW v_route_overview AS
SELECT
    tr.id AS route_id,
    tr.route_number,
    tr.route_name,
    tr.origin,
    tr.destination,
    tr.vehicle_type,
    tr.vehicle_capacity,
    tr.departure_time,
    tr.arrival_time,
    COUNT(bs.id) AS total_stops,
    SUM(COALESCE(bs.passenger_count_avg, 0)) AS total_avg_passengers
FROM transport_routes tr
LEFT JOIN bus_stops bs ON bs.route_id = tr.id
WHERE tr.is_active = TRUE
GROUP BY tr.id, tr.route_number, tr.route_name, tr.origin, tr.destination,
         tr.vehicle_type, tr.vehicle_capacity, tr.departure_time, tr.arrival_time;
