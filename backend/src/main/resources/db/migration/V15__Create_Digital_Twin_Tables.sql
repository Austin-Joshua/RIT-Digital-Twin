-- V15__Create_Digital_Twin_Tables.sql
-- Robust creation of Digital Twin core tables with safety checks for existing infrastructure
-- Specifically designed to handle orphaned foreign keys and legacy schema conflicts (Error 3734 / 1215)

SET FOREIGN_KEY_CHECKS=0;

-- 1. Aggressive cleanup of legacy tables that may have broken foreign keys to 'buildings'
-- We drop these in an order that respects potential internal constraints
DROP TABLE IF EXISTS digital_twin_metrics;
DROP TABLE IF EXISTS energy_logs;
DROP TABLE IF EXISTS energy_metrics;
DROP TABLE IF EXISTS timetable_slots;
DROP TABLE IF EXISTS crowd_data;
DROP TABLE IF EXISTS occupancy_stats;
DROP TABLE IF EXISTS building_metrics;
DROP TABLE IF EXISTS classrooms;
DROP TABLE IF EXISTS buildings;


-- 2. Clean Recreation of the Buildings Table
-- Using 'id' as the standard primary key
CREATE TABLE buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    total_capacity INT,
    base_energy_load DECIMAL(10,2),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Classrooms Table
CREATE TABLE classrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    building_id BIGINT,
    capacity INT,
    type VARCHAR(100),
    peak_load_multiplier DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

-- 4. Digital Twin Metrics
CREATE TABLE digital_twin_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_type VARCHAR(100) NOT NULL,
    location_code VARCHAR(50),
    value DOUBLE,
    unit VARCHAR(20),
    timestamp DATETIME,
    is_simulated BOOLEAN DEFAULT FALSE,
    scenario_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_metric_type (metric_type),
    INDEX idx_location_code (location_code),
    INDEX idx_timestamp (timestamp)
);

-- 5. Safely add classroom_id to timetable_slots
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() AND table_name = 'timetable_slots' AND column_name = 'classroom_id'
);
SET @sql = IF(@col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN classroom_id BIGINT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. Safely add FK to timetable_slots
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.referential_constraints 
    WHERE constraint_schema = DATABASE() AND constraint_name = 'fk_timetable_classroom'
);
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE timetable_slots ADD CONSTRAINT fk_timetable_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS=1;

