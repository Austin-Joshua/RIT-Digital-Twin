-- V13__Fix_Departments_Id_Column.sql
-- The 'departments' table was created with a primary key column named 'dept_id'.
-- The JPA entity expects the column to be 'id'.
-- Guarded: only runs CHANGE COLUMN if 'dept_id' still exists (safe on re-run and fresh DB).

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'departments'
      AND column_name = 'dept_id'
);
SET @sql = IF(@col_exists = 1,
    'ALTER TABLE departments CHANGE COLUMN dept_id id BIGINT NOT NULL AUTO_INCREMENT',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
