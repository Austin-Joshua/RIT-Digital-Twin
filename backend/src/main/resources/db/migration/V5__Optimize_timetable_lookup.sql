-- Timetable performance index for student view
-- Speeds up queries by dept/section/day/time

CREATE INDEX IF NOT EXISTS idx_timetable_dept_section_day_time
  ON timetable_slots(dept_id, section, day_of_week, start_time);

