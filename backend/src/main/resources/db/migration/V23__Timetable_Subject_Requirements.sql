CREATE TABLE IF NOT EXISTS timetable_subject_requirements (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dept_id BIGINT NOT NULL,
    semester_id BIGINT NULL,
    section VARCHAR(30) NOT NULL,
    subject_id BIGINT NOT NULL,
    periods_per_week INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tsr_dept FOREIGN KEY (dept_id) REFERENCES departments(id),
    CONSTRAINT fk_tsr_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    CONSTRAINT fk_tsr_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT uq_timetable_requirement_scope_subject UNIQUE (dept_id, semester_id, section, subject_id),
    CONSTRAINT chk_tsr_periods CHECK (periods_per_week > 0 AND periods_per_week <= 8)
);

CREATE INDEX idx_tsr_dept_section ON timetable_subject_requirements(dept_id, section);

-- CSE-A reference defaults (common CSE core pattern)
INSERT INTO timetable_subject_requirements (dept_id, semester_id, section, subject_id, periods_per_week)
SELECT d.id, s.semester_id, 'CSE-A', subj.id,
       CASE
           WHEN UPPER(subj.subject_code) LIKE '%LAB%' OR LOWER(subj.subject_name) LIKE '%lab%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%project%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%math%' THEN 4
           WHEN LOWER(subj.subject_name) LIKE '%english%' OR LOWER(subj.subject_name) LIKE '%communication%' THEN 3
           ELSE 4
       END
FROM subjects subj
JOIN departments d ON d.id = subj.dept_id
LEFT JOIN semesters s ON s.semester_id = subj.semester_id
WHERE UPPER(d.code) = 'CSE'
ON DUPLICATE KEY UPDATE periods_per_week = VALUES(periods_per_week);

-- CSE-B reference defaults
INSERT INTO timetable_subject_requirements (dept_id, semester_id, section, subject_id, periods_per_week)
SELECT d.id, s.semester_id, 'CSE-B', subj.id,
       CASE
           WHEN UPPER(subj.subject_code) LIKE '%LAB%' OR LOWER(subj.subject_name) LIKE '%lab%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%project%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%math%' THEN 4
           WHEN LOWER(subj.subject_name) LIKE '%english%' OR LOWER(subj.subject_name) LIKE '%communication%' THEN 3
           ELSE 4
       END
FROM subjects subj
JOIN departments d ON d.id = subj.dept_id
LEFT JOIN semesters s ON s.semester_id = subj.semester_id
WHERE UPPER(d.code) = 'CSE'
ON DUPLICATE KEY UPDATE periods_per_week = VALUES(periods_per_week);

-- CSBS-C reference defaults
INSERT INTO timetable_subject_requirements (dept_id, semester_id, section, subject_id, periods_per_week)
SELECT d.id, s.semester_id, 'CSBS-C', subj.id,
       CASE
           WHEN UPPER(subj.subject_code) LIKE '%LAB%' OR LOWER(subj.subject_name) LIKE '%lab%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%project%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%math%' THEN 4
           WHEN LOWER(subj.subject_name) LIKE '%english%' OR LOWER(subj.subject_name) LIKE '%communication%' THEN 3
           ELSE 4
       END
FROM subjects subj
JOIN departments d ON d.id = subj.dept_id
LEFT JOIN semesters s ON s.semester_id = subj.semester_id
WHERE UPPER(d.code) = 'CSBS'
ON DUPLICATE KEY UPDATE periods_per_week = VALUES(periods_per_week);
