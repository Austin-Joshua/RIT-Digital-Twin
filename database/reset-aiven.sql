-- =====================================================
-- RIT Digital Twin – Wipe all tables (Aiven / any MySQL)
-- Run this to remove ALL data, then run schema.sql and seed-data.sql to restore.
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all known tables (order does not matter with FK checks off)
DROP TABLE IF EXISTS mark_history;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS student_transport_mappings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS faculty_leave_request;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS simulation_results;
DROP TABLE IF EXISTS crowd_data;
DROP TABLE IF EXISTS bus_stops;
DROP TABLE IF EXISTS transport_routes;
DROP TABLE IF EXISTS timetable_slots;
DROP TABLE IF EXISTS timetables;
DROP TABLE IF EXISTS energy_logs;
DROP TABLE IF EXISTS classrooms;
DROP TABLE IF EXISTS sustainability_metrics;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS buildings;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- Next: run schema.sql, then seed-data.sql (see QUICK_START.md)
