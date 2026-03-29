-- V15__Create_Digital_Twin_Tables.sql
-- Robust creation of Digital Twin core tables with safety checks for existing infrastructure

-- 1. Buildings Table
SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'buildings');
SET @sql = IF(@tbl_exists = 0, 
    'CREATE TABLE buildings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        total_capacity INT,
        base_energy_load DECIMAL(10,2),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )', 
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure 'id' column exists in buildings if it was created differently
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'buildings' AND column_name = 'id');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Classrooms Table
SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'classrooms');
SET @sql = IF(@tbl_exists = 0, 
    'CREATE TABLE classrooms (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        building_id BIGINT,
        capacity INT,
        type VARCHAR(100),
        peak_load_multiplier DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (building_id) REFERENCES buildings(id)
    )', 
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure 'id' column exists in classrooms if it was created differently (e.g. from an old schema)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'classrooms' AND column_name = 'id');
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0, 'ALTER TABLE classrooms ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

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
-- Final safety check: if classrooms.id still doesn't exist (unlikely now), we skip the FK to prevent migration failure
SET @ref_col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'classrooms' AND column_name = 'id');
SET @sql = IF(@fk_exists = 0 AND @ref_col_exists = 1, 'ALTER TABLE timetable_slots ADD CONSTRAINT fk_timetable_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
