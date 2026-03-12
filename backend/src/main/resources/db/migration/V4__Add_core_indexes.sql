-- Core indexes for production performance
-- Safe to run multiple times on MySQL 8 (IF NOT EXISTS)

-- Student / department / subject relationships
CREATE INDEX IF NOT EXISTS idx_users_dept_id ON users(dept_id);

CREATE INDEX IF NOT EXISTS idx_students_dept_id ON students(dept_id);

CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject_id ON marks(subject_id);

CREATE INDEX IF NOT EXISTS idx_mark_history_mark_id ON mark_history(mark_id);

-- Faculty-related
CREATE INDEX IF NOT EXISTS idx_faculty_leave_faculty_id ON faculty_leave_request(facultyId);

-- Transport-related
CREATE INDEX IF NOT EXISTS idx_bus_stops_route_id ON bus_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_student_transport_route_id ON student_transport_mappings(route_id);
CREATE INDEX IF NOT EXISTS idx_student_transport_student_id ON student_transport_mappings(student_id);

