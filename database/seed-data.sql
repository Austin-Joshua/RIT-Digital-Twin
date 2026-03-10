-- =====================================================
-- RIT Digital Twin – Seed Data
-- =====================================================

-- =====================================================
-- BUILDINGS (INSERT IGNORE = skip if row already exists)
-- =====================================================
INSERT IGNORE INTO buildings (building_name, total_floors, total_capacity, location_coordinates) VALUES
('Main Block', 4, 1500, '12.9520, 80.1360'),
('Academic Block 1', 3, 1000, '12.9522, 80.1362'),
('Academic Block 2', 3, 1000, '12.9524, 80.1364'),
('Science Block', 3, 800, '12.9518, 80.1358'),
('Library Block', 2, 500, '12.9526, 80.1366');

-- =====================================================
-- DEPARTMENTS
-- =====================================================
INSERT IGNORE INTO departments (dept_name, code, head_of_dept) VALUES
('Computer Science & Engineering', 'CSE', 'Dr. Smith'),
('Electronics & Communication Engineering', 'ECE', 'Dr. Johnson'),
('Mechanical Engineering', 'MECH', 'Dr. Williams'),
('Electrical & Electronics Engineering', 'EEE', 'Dr. Brown'),
('Civil Engineering', 'CIVIL', 'Dr. Davis');

-- =====================================================
-- CLASSROOMS
-- =====================================================
INSERT IGNORE INTO classrooms (room_number, building_id, capacity, has_projector, is_smart_classroom) VALUES
('MB-101', 1, 60, TRUE, TRUE),
('MB-102', 1, 60, TRUE, FALSE),
('MB-103', 1, 40, TRUE, FALSE),
('AB1-101', 2, 60, TRUE, FALSE),
('AB1-102', 2, 60, TRUE, FALSE);

-- =====================================================
-- TIMETABLES
-- =====================================================
INSERT IGNORE INTO timetables (classroom_id, department_id, subject_name, course_name, day_of_week, start_time, end_time) VALUES
(1, 1, 'Data Structures', 'BTech CSE', 'MONDAY', '09:00', '10:00'),
(1, 1, 'Operating Systems', 'BTech CSE', 'MONDAY', '10:00', '11:00'),
(2, 1, 'Database Management', 'BTech CSE', 'MONDAY', '09:00', '10:00');

-- =====================================================
-- SAMPLE ENERGY LOGS (one day)
-- =====================================================
INSERT IGNORE INTO energy_logs (building_id, energy_usage_kwh, solar_generated_kwh) VALUES
(1, 45.50, 12.00),
(1, 68.20, 18.50),
(1, 82.40, 25.00),
(2, 42.30, 10.00),
(2, 55.80, 15.00);

-- =====================================================
-- SAMPLE SUSTAINABILITY METRICS
-- =====================================================
INSERT IGNORE INTO sustainability_metrics (date, energy_score, transport_score, waste_management_score, composite_index) VALUES
('2024-12-15', 72.5, 68.0, 75.0, 71.8),
('2024-12-16', 73.0, 69.0, 76.0, 72.5);
