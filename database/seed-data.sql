-- =====================================================
-- RIT Digital Twin – Seed Data
-- =====================================================

-- =====================================================
-- BUILDINGS
-- =====================================================
INSERT INTO buildings (name, code, total_floors, total_area_sqft, latitude, longitude, year_built, building_type) VALUES
('Main Block',              'MB',   4, 45000.00, 12.9520, 80.1360, 1997, 'ACADEMIC'),
('Academic Block 1',        'AB1',  3, 30000.00, 12.9522, 80.1362, 2003, 'ACADEMIC'),
('Academic Block 2',        'AB2',  3, 28000.00, 12.9524, 80.1364, 2008, 'ACADEMIC'),
('Science Block',           'SB',   3, 25000.00, 12.9518, 80.1358, 2005, 'LAB'),
('Library Block',           'LIB',  2, 15000.00, 12.9526, 80.1366, 2000, 'LIBRARY'),
('Administrative Block',    'ADM',  2, 12000.00, 12.9516, 80.1356, 1997, 'ADMINISTRATIVE'),
('Workshop Block',          'WSB',  2, 20000.00, 12.9528, 80.1368, 2010, 'LAB'),
('Sports Complex',          'SC',   1, 35000.00, 12.9530, 80.1370, 2012, 'SPORTS'),
('Hostel Block A',          'HA',   4, 22000.00, 12.9532, 80.1372, 2006, 'HOSTEL'),
('Canteen Block',           'CB',   1, 8000.00,  12.9514, 80.1354, 2002, 'CANTEEN');

-- =====================================================
-- DEPARTMENTS
-- =====================================================
INSERT INTO departments (name, code, building_id, total_faculty, total_students, established_year) VALUES
('Computer Science & Engineering',          'CSE',   1, 45, 720, 1997),
('Electronics & Communication Engineering', 'ECE',   2, 38, 600, 1997),
('Mechanical Engineering',                  'MECH',  3, 32, 480, 1997),
('Electrical & Electronics Engineering',    'EEE',   2, 28, 360, 1997),
('Civil Engineering',                       'CIVIL', 3, 22, 300, 2003),
('Information Technology',                  'IT',    1, 35, 540, 2001),
('Artificial Intelligence & Data Science',  'AIDS',  1, 20, 300, 2020),
('Biomedical Engineering',                  'BME',   4, 18, 240, 2008),
('Science & Humanities',                    'S&H',   4, 40, 0,   1997),
('Master of Business Administration',       'MBA',   6, 15, 120, 2005);

-- =====================================================
-- CLASSROOMS
-- =====================================================
INSERT INTO classrooms (room_number, building_id, floor, capacity, room_type, has_projector, has_ac, has_smart_board) VALUES
-- Main Block
('MB-101', 1, 1, 60, 'LECTURE_HALL', TRUE, TRUE, TRUE),
('MB-102', 1, 1, 60, 'LECTURE_HALL', TRUE, TRUE, FALSE),
('MB-103', 1, 1, 40, 'TUTORIAL',    TRUE, TRUE, FALSE),
('MB-201', 1, 2, 80, 'LECTURE_HALL', TRUE, TRUE, TRUE),
('MB-202', 1, 2, 60, 'LECTURE_HALL', TRUE, FALSE, FALSE),
('MB-301', 1, 3, 120,'SEMINAR',     TRUE, TRUE, TRUE),
('MB-401', 1, 4, 300,'AUDITORIUM',  TRUE, TRUE, TRUE),
-- Academic Block 1
('AB1-101', 2, 1, 60, 'LECTURE_HALL', TRUE, FALSE, FALSE),
('AB1-102', 2, 1, 60, 'LECTURE_HALL', TRUE, FALSE, FALSE),
('AB1-201', 2, 2, 40, 'LAB',         TRUE, TRUE,  TRUE),
('AB1-202', 2, 2, 40, 'LAB',         TRUE, TRUE,  TRUE),
('AB1-301', 2, 3, 60, 'LECTURE_HALL', TRUE, FALSE, FALSE),
-- Academic Block 2
('AB2-101', 3, 1, 60, 'LECTURE_HALL', TRUE, FALSE, FALSE),
('AB2-102', 3, 1, 60, 'LECTURE_HALL', TRUE, FALSE, FALSE),
('AB2-201', 3, 2, 40, 'LAB',         TRUE, TRUE,  FALSE),
('AB2-301', 3, 3, 60, 'LECTURE_HALL', TRUE, FALSE, FALSE),
-- Science Block
('SB-101',  4, 1, 30, 'LAB',         TRUE, TRUE,  TRUE),
('SB-102',  4, 1, 30, 'LAB',         TRUE, TRUE,  TRUE),
('SB-201',  4, 2, 30, 'LAB',         TRUE, TRUE,  TRUE),
('SB-301',  4, 3, 20, 'CONFERENCE',  TRUE, TRUE,  TRUE);

-- =====================================================
-- TIMETABLES (sample entries)
-- =====================================================
INSERT INTO timetables (classroom_id, department_id, subject_name, subject_code, day_of_week, start_time, end_time, semester, section, academic_year, student_count) VALUES
(1,  1, 'Data Structures',          'CS2201', 'MONDAY',    '09:00', '10:00', 3, 'A', '2024-2025', 55),
(1,  1, 'Operating Systems',        'CS2302', 'MONDAY',    '10:00', '11:00', 5, 'A', '2024-2025', 58),
(2,  1, 'Database Management',      'CS2203', 'MONDAY',    '09:00', '10:00', 3, 'B', '2024-2025', 52),
(4,  1, 'Machine Learning',         'CS2401', 'TUESDAY',   '11:00', '12:00', 7, 'A', '2024-2025', 70),
(8,  2, 'Signal Processing',        'EC2201', 'WEDNESDAY', '09:00', '10:00', 3, 'A', '2024-2025', 55),
(13, 3, 'Thermodynamics',           'ME2102', 'THURSDAY',  '10:00', '11:00', 3, 'A', '2024-2025', 58),
(10, 2, 'VLSI Lab',                 'EC2205', 'FRIDAY',    '14:00', '17:00', 5, 'A', '2024-2025', 35),
(17, 8, 'Biomedical Instrumentation','BM2201','TUESDAY',   '09:00', '10:00', 3, 'A', '2024-2025', 28);

-- =====================================================
-- TRANSPORT ROUTES (Updated for RIT Transport Features)
-- =====================================================
INSERT INTO transport_routes (route_number, route_name, start_point, end_point, bus_number, capacity, current_occupancy, coordinator_name, coordinator_phone) VALUES
('R01', 'Ennore Route', 'Ennore', 'RIT Campus', 'TN-01-AX-1234', 56, 45, 'Mr. Ramesh', '9840012345'),
('R11A', 'Chengalpattu Route', 'Chengalpattu', 'RIT Campus', 'TN-01-BY-5678', 56, 38, 'Mr. Suresh', '9840054321'),
('R22', 'Tambaram Route', 'Tambaram Station', 'RIT Campus', 'TN-01-CZ-9012', 56, 50, 'Ms. Priya', '9841122334'),
('R05', 'OMR IT Corridor', 'Sholinganallur', 'RIT Campus', 'TN-01-DW-3456', 50, 30, 'Mr. Karthik', '9840099887');

-- =====================================================
-- BUS STOPS (Updated for Boarding Points & Timings)
-- =====================================================
INSERT INTO bus_stops (route_id, stop_name, pickup_time, stop_order, landmark) VALUES
(1, 'Ennore',           '05:50:00', 1, 'Near Railway Station'),
(1, 'Ernavoor',         '06:05:00', 2, 'Market Junction'),
(1, 'Thiruvottiyur',    '06:20:00', 3, 'Theradi Metro'),
(1, 'RIT Campus',       '08:00:00', 4, 'Main Gate'),

(2, 'Chengalpattu',     '06:00:00', 1, 'Old Bus Stand'),
(2, 'Maraimalai Nagar', '06:25:00', 2, 'Ford Factory Junction'),
(2, 'Potheri',          '06:40:00', 3, 'SRM University Gate'),
(2, 'RIT Campus',       '08:10:00', 4, 'Main Gate');

-- =====================================================
-- SAMPLE ENERGY LOGS (one day)
-- =====================================================
INSERT INTO energy_logs (building_id, reading_date, reading_hour, consumption_kwh, solar_generation_kwh, peak_demand_kw, temperature_c, hvac_usage_kwh, lighting_kwh, source) VALUES
(1, '2024-12-15', 8,  45.50, 12.00, 120.0, 26.5, 15.00, 10.50, 'SENSOR'),
(1, '2024-12-15', 9,  68.20, 18.50, 180.0, 28.0, 22.00, 12.00, 'SENSOR'),
(1, '2024-12-15', 10, 82.40, 25.00, 210.0, 30.5, 30.00, 12.50, 'SENSOR'),
(1, '2024-12-15', 11, 90.10, 28.00, 225.0, 32.0, 35.00, 12.00, 'SENSOR'),
(1, '2024-12-15', 12, 75.80, 30.00, 195.0, 33.5, 28.00, 10.00, 'SENSOR'),
(1, '2024-12-15', 13, 60.20, 27.00, 160.0, 34.0, 25.00,  8.50, 'SENSOR'),
(1, '2024-12-15', 14, 72.50, 24.00, 185.0, 33.0, 28.00, 10.00, 'SENSOR'),
(1, '2024-12-15', 15, 65.30, 20.00, 170.0, 31.5, 24.00,  9.50, 'SENSOR'),
(1, '2024-12-15', 16, 48.70, 15.00, 135.0, 29.0, 18.00,  8.00, 'SENSOR'),
(1, '2024-12-15', 17, 30.10,  8.00,  85.0, 27.0, 10.00,  6.50, 'SENSOR'),
(2, '2024-12-15', 9,  42.30, 10.00, 110.0, 27.5, 15.00,  8.00, 'SENSOR'),
(2, '2024-12-15', 10, 55.80, 15.00, 140.0, 29.5, 20.00,  9.00, 'SENSOR'),
(2, '2024-12-15', 14, 50.20, 14.00, 130.0, 32.0, 18.00,  8.50, 'SENSOR');

-- =====================================================
-- SAMPLE SUSTAINABILITY METRICS
-- =====================================================
INSERT INTO sustainability_metrics (metric_date, building_id, carbon_emission_kg, carbon_offset_kg, water_usage_liters, water_recycled_liters, waste_generated_kg, waste_recycled_kg, solar_energy_kwh, sustainability_score, source) VALUES
('2024-12-15', 1,  250.00, 45.00, 5000.00, 1500.00, 120.00, 48.00, 68.00, 72.5, 'MEASURED'),
('2024-12-15', 2,  180.00, 30.00, 3500.00, 1050.00,  85.00, 34.00, 45.00, 68.0, 'MEASURED'),
('2024-12-15', 3,  160.00, 25.00, 3200.00,  960.00,  72.00, 28.80, 40.00, 65.5, 'MEASURED'),
('2024-12-15', NULL, 850.00, 180.00, 18000.00, 5400.00, 480.00, 192.00, 250.00, 70.2, 'CALCULATED');
