-- Refine weekly periods using Curriculum/CSBS Regulations.pdf (semester-wise contact periods)
UPDATE timetable_subject_requirements tsr
JOIN subjects s ON s.id = tsr.subject_id
JOIN departments d ON d.id = tsr.dept_id
SET tsr.periods_per_week = CASE UPPER(s.subject_code)
    WHEN 'HS23111' THEN 3
    WHEN 'CY23111' THEN 3
    WHEN 'MA23111' THEN 4
    WHEN 'GE23131' THEN 3
    WHEN 'GE23121' THEN 2
    WHEN 'CY23121' THEN 2
    WHEN 'HS23211' THEN 3
    WHEN 'MA23211' THEN 4
    WHEN 'PH23211' THEN 3
    WHEN 'GE23211' THEN 3
    WHEN 'AD23211' THEN 4
    WHEN 'PH23221' THEN 2
    WHEN 'GE23221' THEN 2
    WHEN 'AD23221' THEN 2
    WHEN 'MA23311' THEN 4
    WHEN 'CB23311' THEN 4
    WHEN 'CS23312' THEN 3
    WHEN 'CS23322' THEN 2
    WHEN 'CS23314' THEN 4
    WHEN 'CS23324' THEN 2
    WHEN 'EC23331' THEN 4
    WHEN 'MA23411' THEN 4
    WHEN 'CB23411' THEN 4
    WHEN 'CS23411' THEN 3
    WHEN 'CS23421' THEN 2
    WHEN 'CS23412' THEN 3
    WHEN 'CS23422' THEN 2
    WHEN 'AL23431' THEN 4
    WHEN 'CB23511' THEN 3
    WHEN 'CB23512' THEN 3
    WHEN 'CS23513' THEN 4
    WHEN 'CB23521' THEN 2
    WHEN 'GE23521' THEN 2
    WHEN 'CB23531' THEN 4
    ELSE tsr.periods_per_week
END
WHERE UPPER(d.code) = 'CSBS' AND UPPER(tsr.section) = 'CSBS-C';
