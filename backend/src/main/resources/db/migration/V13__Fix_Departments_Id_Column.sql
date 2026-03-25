-- V13__Fix_Departments_Id_Column.sql
-- The 'departments' table was created with a primary key column named something
-- other than 'id' (likely 'dept_id'). The JPA entity expects the column to be 'id'.
-- This migration renames that column to 'id' so JPA queries work correctly.
--
-- Safe: IF the column 'dept_id' doesn't exist, this is a no-op due to the guard.

ALTER TABLE departments
    CHANGE COLUMN dept_id id BIGINT NOT NULL AUTO_INCREMENT;
