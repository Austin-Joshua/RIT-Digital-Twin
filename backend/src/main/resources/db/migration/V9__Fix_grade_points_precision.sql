-- Prevent DataIntegrityViolation when grade points reach 10.00
ALTER TABLE grades
    MODIFY COLUMN grade_points DECIMAL(4,2) NOT NULL;
