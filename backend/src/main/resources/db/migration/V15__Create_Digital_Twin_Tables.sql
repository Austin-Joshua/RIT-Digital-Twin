-- V15__Create_Digital_Twin_Tables.sql
-- Robust creation of Digital Twin core tables with safety checks for existing infrastructure

-- Check if legacy non-id buildings table exists
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'buildings' AND column_name = 'id');
SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'buildings');

SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'DROP TABLE IF EXISTS classrooms', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'DROP TABLE IF EXISTS buildings', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 1. Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    total_capacity INT,
    base_energy_load DECIMAL(10,2),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Classrooms Table
CREATE TABLE IF NOT EXISTS classrooms (
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

-- 3. Digital Twin Metrics
CREATE TABLE IF NOT EXISTS digital_twin_metrics (
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

-- 4. Safely add classroom_id to timetable_slots
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() AND table_name = 'timetable_slots' AND column_name = 'classroom_id'
);
SET @sql = IF(@col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN classroom_id BIGINT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Safely add FK to timetable_slots
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.referential_constraints 
    WHERE constraint_schema = DATABASE() AND constraint_name = 'fk_timetable_classroom'
);
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE timetable_slots ADD CONSTRAINT fk_timetable_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
