-- Expand timetable subject requirements for full CSE department sections (A to G).
-- This enables department-wide generation instead of single-section generation.

INSERT INTO timetable_subject_requirements (dept_id, semester_id, section, subject_id, periods_per_week)
SELECT d.id, s.semester_id, sec.section_code, subj.id,
       CASE
           WHEN UPPER(subj.subject_code) LIKE '%LAB%' OR LOWER(subj.subject_name) LIKE '%lab%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%project%' THEN 2
           WHEN LOWER(subj.subject_name) LIKE '%math%' THEN 4
           WHEN LOWER(subj.subject_name) LIKE '%english%' OR LOWER(subj.subject_name) LIKE '%communication%' THEN 3
           ELSE 4
       END AS periods_per_week
FROM subjects subj
JOIN departments d ON d.id = subj.dept_id
LEFT JOIN semesters s ON s.semester_id = subj.semester_id
JOIN (
    SELECT 'CSE-A' AS section_code
    UNION ALL SELECT 'CSE-B'
    UNION ALL SELECT 'CSE-C'
    UNION ALL SELECT 'CSE-D'
    UNION ALL SELECT 'CSE-E'
    UNION ALL SELECT 'CSE-F'
    UNION ALL SELECT 'CSE-G'
) sec
WHERE UPPER(d.code) = 'CSE'
ON DUPLICATE KEY UPDATE periods_per_week = VALUES(periods_per_week);
