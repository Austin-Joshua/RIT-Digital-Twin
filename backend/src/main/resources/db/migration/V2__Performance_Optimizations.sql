-- RIT Digital Twin Performance Optimization Script

-- Indexing for rapid authentication and user lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Indexing for Simulation data (Audit & Filtering)
CREATE INDEX idx_simulation_building ON simulation_results(building_id);
CREATE INDEX idx_simulation_timestamp ON simulation_results(timestamp);
CREATE INDEX idx_simulation_type ON simulation_results(simulation_type);

-- Indexing for Energy monitoring
CREATE INDEX idx_energy_building_time ON energy_logs(building_id, timestamp);

-- Indexing for Classroom occupancy
CREATE INDEX idx_classroom_building ON classrooms(building_id);

-- Cleanup of redundant data or potential fragmentation (Optional/Enterprise)
-- ANALYZE TABLE users;
-- ANALYZE TABLE simulation_results;
-- ANALYZE TABLE energy_logs;
