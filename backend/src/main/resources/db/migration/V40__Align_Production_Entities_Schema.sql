-- V40: Align Production Entities Schema for Real 3D Campus Building Geometry and Timetable Slot Foreign Keys
SET @dbname = DATABASE();

-- =========================================================================
-- 1. BUILDINGS: Real-world Geospatial & 3D Geometry Attributes
-- =========================================================================

-- latitude
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'latitude');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN latitude DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- longitude
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'longitude');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN longitude DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- footprint_geometry
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'footprint_geometry');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN footprint_geometry TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- height_meters
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'height_meters');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN height_meters DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- number_of_levels
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'number_of_levels');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN number_of_levels INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- geometry_source
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'geometry_source');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN geometry_source VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- geometry_status
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'geometry_status');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN geometry_status VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- height_source
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'height_source');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN height_source VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- osm_way_id
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'osm_way_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN osm_way_id VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- model_asset_url
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'model_asset_url');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN model_asset_url VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- source_updated_at
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'source_updated_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN source_updated_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- last_verified_at
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'last_verified_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE buildings ADD COLUMN last_verified_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================================
-- 2. TIMETABLE_SLOTS: Department, Faculty, Subject, Section Alignment
-- =========================================================================

-- dept_id
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'dept_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN dept_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- faculty_id
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'faculty_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN faculty_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- subject_id
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'subject_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN subject_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- section
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'section');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN section VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Synchronize section column from legacy section_code if empty
SET @sql = 'UPDATE timetable_slots SET section = section_code WHERE (section IS NULL OR section = '''') AND section_code IS NOT NULL';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
