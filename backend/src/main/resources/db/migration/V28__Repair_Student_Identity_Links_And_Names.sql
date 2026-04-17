-- Repair stale student identity mappings and names.
-- Source of truth for student display identity is students.student_name + students.register_no.

-- 1) Primary relink: users <-> students by direct user_id ownership.
UPDATE users u
JOIN students s ON s.user_id = u.user_id
SET u.linked_student_id = s.id
WHERE u.linked_student_id IS NULL OR u.linked_student_id <> s.id;

-- 2) Fallback relink: users.username equals register number.
UPDATE users u
JOIN students s ON s.register_no = u.username
SET u.linked_student_id = s.id
WHERE u.linked_student_id IS NULL OR u.linked_student_id <> s.id;

-- 3) Fallback relink for Google/local emails that include register number in local-part.
UPDATE users u
JOIN students s ON u.email IS NOT NULL
              AND LOWER(u.email) LIKE CONCAT('%', LOWER(s.register_no), '@%')
SET u.linked_student_id = s.id
WHERE u.linked_student_id IS NULL OR u.linked_student_id <> s.id;

-- 4) Remove stale user first/last names by resyncing from students.student_name.
UPDATE users u
JOIN students s ON s.id = u.linked_student_id
SET u.first_name = SUBSTRING_INDEX(TRIM(s.student_name), ' ', 1),
    u.last_name = CASE
        WHEN LOCATE(' ', TRIM(s.student_name)) > 0
            THEN TRIM(SUBSTRING(TRIM(s.student_name), LOCATE(' ', TRIM(s.student_name)) + 1))
        ELSE ''
    END
WHERE s.student_name IS NOT NULL
  AND TRIM(s.student_name) <> '';
