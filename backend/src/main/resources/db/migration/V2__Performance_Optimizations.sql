-- RIT Digital Twin Performance Optimization Script (idempotent + safe)

-- users.username
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_username'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_users_username ON users(username)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- users.role_id
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_role_id'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_users_role_id ON users(role_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- simulation_results indexes (only if table exists)
SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'simulation_results'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'simulation_results' AND index_name = 'idx_simulation_type'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_simulation_type ON simulation_results(sim_type)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'simulation_results' AND index_name = 'idx_simulation_started_at'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_simulation_started_at ON simulation_results(started_at)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- energy_logs index (only if table exists)
SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'energy_logs'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'energy_logs' AND index_name = 'idx_energy_building_time'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_energy_building_time ON energy_logs(building_id, timestamp)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- classrooms index (only if table exists)
SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'classrooms'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'classrooms' AND index_name = 'idx_classroom_building'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_classroom_building ON classrooms(building_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cleanup of redundant data or potential fragmentation (Optional/Enterprise)
-- ANALYZE TABLE users;
-- ANALYZE TABLE simulation_results;
-- ANALYZE TABLE energy_logs;
