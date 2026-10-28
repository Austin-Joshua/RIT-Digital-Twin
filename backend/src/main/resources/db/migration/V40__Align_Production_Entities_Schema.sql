-- V40: Align Production Entities Schema for Real 3D Campus Building Geometry and Timetable Slot Foreign Keys
-- Idempotent, safe migration that tolerates partially applied DDL and diverse schema branches.
SET @dbname = DATABASE();

-- =========================================================================
-- 1. BUILDINGS: Real-world Geospatial & 3D Geometry Attributes
-- =========================================================================

SET @tbl_buildings = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'buildings');

-- latitude
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'latitude');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN latitude DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- longitude
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'longitude');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN longitude DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- footprint_geometry
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'footprint_geometry');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN footprint_geometry TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- height_meters
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'height_meters');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN height_meters DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- number_of_levels
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'number_of_levels');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN number_of_levels INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- geometry_source
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'geometry_source');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN geometry_source VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- geometry_status
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'geometry_status');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN geometry_status VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- height_source
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'height_source');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN height_source VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- osm_way_id
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'osm_way_id');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN osm_way_id VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- model_asset_url
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'model_asset_url');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN model_asset_url VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- source_updated_at
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'source_updated_at');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN source_updated_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- last_verified_at
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'buildings' AND column_name = 'last_verified_at');
SET @sql = IF(@tbl_buildings = 1 AND @col_exists = 0, 'ALTER TABLE buildings ADD COLUMN last_verified_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- =========================================================================
-- 2. TIMETABLE_SLOTS: Department, Faculty, Subject, Section Alignment
-- =========================================================================

SET @tbl_slots = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = @dbname AND table_name = 'timetable_slots');

-- dept_id
SET @col_dept_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'dept_id');
SET @sql = IF(@tbl_slots = 1 AND @col_dept_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN dept_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- faculty_id
SET @col_fac_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'faculty_id');
SET @sql = IF(@tbl_slots = 1 AND @col_fac_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN faculty_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- subject_id
SET @col_subj_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'subject_id');
SET @sql = IF(@tbl_slots = 1 AND @col_subj_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN subject_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- section (required by TimetableSlot entity: private String section)
SET @col_section_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'section');
SET @sql = IF(@tbl_slots = 1 AND @col_section_exists = 0, 'ALTER TABLE timetable_slots ADD COLUMN section VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Safely synchronize section from legacy section_code ONLY if section_code exists in the table.
-- If section_code does not exist, @sql is 'SELECT 1', completely omitting the section_code token.
SET @col_section_code_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'section_code');
SET @sql = IF(@tbl_slots = 1 AND @col_section_code_exists = 1,
    'UPDATE timetable_slots SET section = section_code WHERE (section IS NULL OR section = '''') AND section_code IS NOT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Safely backfill faculty_id from legacy faculty_username ONLY if faculty_username exists.
SET @col_fac_user_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'faculty_username');
SET @sql = IF(@tbl_slots = 1 AND @col_fac_user_exists = 1,
    'UPDATE timetable_slots ts JOIN users u ON ts.faculty_username = u.username SET ts.faculty_id = u.user_id WHERE ts.faculty_id IS NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Safely backfill subject_id from legacy subject_code ONLY if subject_code exists.
SET @col_subj_code_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND column_name = 'subject_code');
SET @sql = IF(@tbl_slots = 1 AND @col_subj_code_exists = 1,
    'UPDATE timetable_slots ts JOIN subjects s ON ts.subject_code = s.subject_code SET ts.subject_id = s.id WHERE ts.subject_id IS NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Safely ensure indexes exist on foreign key columns
SET @idx_fac_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND index_name = 'idx_timetable_faculty_id');
SET @sql = IF(@tbl_slots = 1 AND @idx_fac_exists = 0, 'CREATE INDEX idx_timetable_faculty_id ON timetable_slots(faculty_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_subj_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = 'timetable_slots' AND index_name = 'idx_timetable_subject_id');
SET @sql = IF(@tbl_slots = 1 AND @idx_subj_exists = 0, 'CREATE INDEX idx_timetable_subject_id ON timetable_slots(subject_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
