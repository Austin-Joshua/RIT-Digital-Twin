-- Timetable performance index for student view (idempotent + MySQL-safe)
SET @tbl_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'timetable_slots'
);
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'timetable_slots' AND index_name = 'idx_timetable_dept_section_day_time'
);
SET @sql = IF(
  @tbl_exists = 1 AND @idx_exists = 0,
  'CREATE INDEX idx_timetable_dept_section_day_time ON timetable_slots(dept_id, section, day_of_week, start_time)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

