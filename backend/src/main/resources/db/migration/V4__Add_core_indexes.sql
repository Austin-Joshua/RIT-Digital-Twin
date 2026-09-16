-- Core indexes for production performance (idempotent + MySQL-safe)

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'users'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_dept_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_users_dept_id ON users(dept_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'students'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'students' AND index_name = 'idx_students_dept_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_students_dept_id ON students(dept_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'marks'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'marks' AND index_name = 'idx_marks_student_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_marks_student_id ON marks(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'marks' AND index_name = 'idx_marks_subject_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_marks_subject_id ON marks(subject_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'mark_history'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'mark_history' AND index_name = 'idx_mark_history_mark_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_mark_history_mark_id ON mark_history(mark_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'faculty_leave_request'
);
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'faculty_leave_request' AND column_name = 'facultyId'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'faculty_leave_request' AND index_name = 'idx_faculty_leave_faculty_id'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_faculty_leave_faculty_id ON faculty_leave_request(facultyId)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'bus_stops'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'bus_stops' AND index_name = 'idx_bus_stops_route_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_bus_stops_route_id ON bus_stops(route_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'student_transport_mappings'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'student_transport_mappings' AND index_name = 'idx_student_transport_route_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_student_transport_route_id ON student_transport_mappings(route_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'student_transport_mappings' AND index_name = 'idx_student_transport_student_id'
);
SET @sql = IF(@tbl_exists = 1 AND @idx_exists = 0, 'CREATE INDEX idx_student_transport_student_id ON student_transport_mappings(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

