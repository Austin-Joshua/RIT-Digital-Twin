USE rit_digital_twin;

-- Get Student Role and Departments (assuming they exist or creating them)
INSERT IGNORE INTO roles (role_name) VALUES ('STUDENT');
INSERT IGNORE INTO departments (code, dept_name) VALUES ('CSE', 'B.E. Computer Science and Engineering');
INSERT IGNORE INTO departments (code, dept_name) VALUES ('CSBS', 'B.Tech. Computer Science and Business Systems');

SET @role_id = (SELECT role_id FROM roles WHERE role_name = 'STUDENT');
SET @cse_id = (SELECT id FROM departments WHERE code = 'CSE');
SET @csbs_id = (SELECT id FROM departments WHERE code = 'CSBS');

DROP PROCEDURE IF EXISTS SeedStudents;
DELIMITER //
CREATE PROCEDURE SeedStudents()
BEGIN
    DECLARE i BIGINT;
    
    -- CSE Batch
    SET i = 2117240020001;
    WHILE i <= 2117240020062 DO
        IF NOT EXISTS (SELECT 1 FROM users WHERE username = CAST(i AS CHAR)) THEN
            INSERT INTO users (username, password_hash, email, first_name, last_name, role_id, dept_id, account_status, must_change_password, failed_login_attempts, created_at, updated_at)
            VALUES (CAST(i AS CHAR), '$2a$10$8.UnVuG9HHgffUDAlk8UrOrpymLhnAkqi0WpOoL.JlXfJ4.iaNviG', CONCAT(i, '@ritchennai.edu.in'), 'CSE-Student', CAST(i % 100 AS CHAR), @role_id, @cse_id, 'active', 1, 0, NOW(), NOW());
            
            SET @user_id = LAST_INSERT_ID();
            
            INSERT INTO students (user_id, register_no, student_id_number, student_name, section, `batch`, `year`, `status`, department_id, scholar_type, email, created_at, updated_at)
            VALUES (@user_id, CAST(i AS CHAR), CONCAT('24CSE', RIGHT(CAST(i AS CHAR), 3)), CONCAT('CSE-Student ', i % 100), 'CSE-A', '2024-2028', 1, 'active', @cse_id, IF(i % 2 = 0, 'Hosteller', 'Day Scholar'), CONCAT(i, '@ritchennai.edu.in'), NOW(), NOW());
            
            UPDATE users SET linked_student_id = LAST_INSERT_ID() WHERE user_id = @user_id;
        END IF;
        SET i = i + 1;
    END WHILE;

    -- CSBS Batch
    SET i = 2117240080119;
    WHILE i <= 2117240080177 DO
        IF NOT EXISTS (SELECT 1 FROM users WHERE username = CAST(i AS CHAR)) THEN
            INSERT INTO users (username, password_hash, email, first_name, last_name, role_id, dept_id, account_status, must_change_password, failed_login_attempts, created_at, updated_at)
            VALUES (CAST(i AS CHAR), '$2a$10$8.UnVuG9HHgffUDAlk8UrOrpymLhnAkqi0WpOoL.JlXfJ4.iaNviG', CONCAT(i, '@ritchennai.edu.in'), 'CSBS-Student', CAST(i % 100 AS CHAR), @role_id, @csbs_id, 'active', 1, 0, NOW(), NOW());
            
            SET @user_id = LAST_INSERT_ID();
            
            INSERT INTO students (user_id, register_no, student_id_number, student_name, section, `batch`, `year`, `status`, department_id, scholar_type, email, created_at, updated_at)
            VALUES (@user_id, CAST(i AS CHAR), CONCAT('24CSBS', RIGHT(CAST(i AS CHAR), 3)), CONCAT('CSBS-Student ', i % 100), 'CSBS', '2024-2028', 1, 'active', @csbs_id, IF(i % 2 != 0, 'Hosteller', 'Day Scholar'), CONCAT(i, '@ritchennai.edu.in'), NOW(), NOW());
            
            UPDATE users SET linked_student_id = LAST_INSERT_ID() WHERE user_id = @user_id;
        END IF;
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL SeedStudents();
DROP PROCEDURE SeedStudents;
