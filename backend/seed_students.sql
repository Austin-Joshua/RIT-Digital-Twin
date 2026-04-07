USE rit_digital_twin;

-- Get Student Role and Departments
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
    DECLARE first_name_val VARCHAR(255);
    DECLARE last_name_val VARCHAR(255);
    DECLARE scholar_type_val VARCHAR(50);
    DECLARE full_name_val VARCHAR(255);
    
    -- CSE Batch with Real Names
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_cse_students (
        reg_no BIGINT,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        scholar_type VARCHAR(50)
    );
    
    INSERT INTO temp_cse_students VALUES
    (2117240020001, 'AAKASH', 'B K', 'Day Scholar'),
    (2117240020002, 'AARTHI', 'M', 'Hosteller'),
    (2117240020003, 'AASHIDA', 'V', 'Day Scholar'),
    (2117240020004, 'ABHILASH', 'M', 'Hosteller'),
    (2117240020005, 'ABIMANUE', 'M', 'Day Scholar'),
    (2117240020006, 'ABINA JERLIN', 'M', 'Day Scholar'),
    (2117240020007, 'ABINAYA', 'S G', 'Day Scholar'),
    (2117240020008, 'ABINESH', 'S', 'Day Scholar'),
    (2117240020009, 'ABIRAMI', 'B', 'Hosteller'),
    (2117240020010, 'ABISHEK', 'S', 'Day Scholar'),
    (2117240020011, 'ADARSH', 'H', 'Day Scholar'),
    (2117240020012, 'ADITYA', 'PARTHASARATHY', 'Day Scholar'),
    (2117240020013, 'AFSA', 'R', 'Day Scholar'),
    (2117240020014, 'AISWARYAA', 'BABU', 'Day Scholar'),
    (2117240020015, 'AKASH', 'A', 'Day Scholar'),
    (2117240020016, 'AKSHARA', 'P', 'Day Scholar'),
    (2117240020017, 'AKSHAY', 'V', 'Hosteller'),
    (2117240020018, 'AKSHAYA', 'K', 'Hosteller'),
    (2117240020019, 'AKSHAYA', 'M', 'Day Scholar'),
    (2117240020020, 'AKSHAYA', 'R L', 'Day Scholar'),
    (2117240020021, 'AKSHAYA DARSHINI', 'N', 'Day Scholar'),
    (2117240020022, 'AKSHITHA', 'P', 'Day Scholar'),
    (2117240020023, 'AKSHITHA', 'S', 'Day Scholar'),
    (2117240020024, 'AMBATI', 'NIKHITHA', 'Hosteller'),
    (2117240020025, 'AMUDHAN', 'M', 'Hosteller'),
    (2117240020026, 'ANISHA', 'PATHAK', 'Day Scholar'),
    (2117240020027, 'ANISKA', 'S P', 'Day Scholar'),
    (2117240020028, 'ANJASRI', 'V', 'Hosteller'),
    (2117240020029, 'ANUSHA', 'B', 'Hosteller'),
    (2117240020030, 'ANU SHRI', 'R', 'Day Scholar'),
    (2117240020031, 'ARAVINDRAJ', 'D', 'Day Scholar'),
    (2117240020032, 'ARNAV KUMAR', 'R', 'Day Scholar'),
    (2117240020033, 'ARVIND', 'N', 'Day Scholar'),
    (2117240020034, 'ASANTHIKA', 'A', 'Hosteller'),
    (2117240020035, 'ASEEMA', 'S', 'Day Scholar'),
    (2117240020036, 'ASHA', 'A', 'Hosteller'),
    (2117240020037, 'ASHWIN', 'G', 'Day Scholar'),
    (2117240020038, 'ASIN', 'D', 'Hosteller'),
    (2117240020039, 'ASWANTHAR', 'M', 'Hosteller'),
    (2117240020040, 'ASWIN', 'R', 'Day Scholar'),
    (2117240020041, 'ASWIN KUMAR', 'E N', 'Day Scholar'),
    (2117240020042, 'ASWINI', 'M', 'Day Scholar'),
    (2117240020043, 'ATHISHWAR', 'J', 'Day Scholar'),
    (2117240020044, 'AUSTIN JOSHUA', 'M', 'Day Scholar'),
    (2117240020045, 'AVINESHWARAN', 'A', 'Hosteller'),
    (2117240020046, 'BALAJI', 'M R', 'Hosteller'),
    (2117240020047, 'BALAJI', 'P', 'Day Scholar'),
    (2117240020048, 'BASKAR', 'J', 'Day Scholar'),
    (2117240020049, 'BAVATHARINI', 'R', 'Day Scholar'),
    (2117240020050, 'BHARANIDHARAN', 'R', 'Hosteller'),
    (2117240020051, 'BHUVANESHWARAN', 'S', 'Hosteller'),
    (2117240020052, 'CATHERIN JENIRA', 'I', 'Hosteller'),
    (2117240020053, 'CHARUMATHI', 'K', 'Day Scholar'),
    (2117240020054, 'CHRIS', 'ALAN', 'Hosteller'),
    (2117240020055, 'CHRIS MELVYN RAJ', 'P', 'Day Scholar'),
    (2117240020056, 'CHRISTOPHER', 'J', 'Day Scholar'),
    (2117240020057, 'DARSHAN', 'A R', 'Day Scholar'),
    (2117240020058, 'DARSHAN', 'B', 'Day Scholar'),
    (2117240020059, 'DEBORHAL', 'L', 'Hosteller'),
    (2117240020060, 'DEEPA SHREE', 'C', 'Day Scholar'),
    (2117240020061, 'DEEPESH', 'V', 'Day Scholar'),
    (2117240020062, 'DEEPIKA', 'P', 'Hosteller');

    -- Insert CSE Students from Temporary Table
    SET i = 2117240020001;
    WHILE i <= 2117240020062 DO
        SELECT first_name, last_name, scholar_type INTO first_name_val, last_name_val, scholar_type_val 
        FROM temp_cse_students WHERE reg_no = i;
        
        SET full_name_val = CONCAT(first_name_val, ' ', last_name_val);

        IF NOT EXISTS (SELECT 1 FROM users WHERE username = CAST(i AS CHAR)) THEN
            INSERT INTO users (username, password_hash, email, first_name, last_name, role_id, dept_id, account_status, must_change_password, failed_login_attempts, created_at, updated_at)
            VALUES (CAST(i AS CHAR), '$2a$10$8.UnVuG9HHgffUDAlk8UrOrpymLhnAkqi0WpOoL.JlXfJ4.iaNviG', CONCAT(i, '@ritchennai.edu.in'), first_name_val, last_name_val, @role_id, @cse_id, 'active', 1, 0, NOW(), NOW());
            
            SET @user_id = LAST_INSERT_ID();
            
            INSERT INTO students (user_id, register_no, student_id_number, student_name, section, `batch`, `year`, `status`, department_id, scholar_type, email, created_at, updated_at)
            VALUES (@user_id, CAST(i AS CHAR), CONCAT('24CSE', RIGHT(CAST(i AS CHAR), 3)), full_name_val, 'CSE-A', '2024-2028', 1, 'active', @cse_id, scholar_type_val, CONCAT(i, '@ritchennai.edu.in'), NOW(), NOW());
            
            UPDATE users SET linked_student_id = LAST_INSERT_ID() WHERE user_id = @user_id;
        END IF;
        SET i = i + 1;
    END WHILE;
    
    DROP TEMPORARY TABLE temp_cse_students;

    -- CSBS Batch with Real Names
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_csbs_students (
        reg_no BIGINT,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        scholar_type VARCHAR(50)
    );
    
    INSERT INTO temp_csbs_students VALUES
    (2117240080119, 'SACHIN', 'S', 'Day Scholar'),
    (2117240080120, 'SAI JEEVA', 'S', 'Day Scholar'),
    (2117240080121, 'SANJANA', 'M', 'Day Scholar'),
    (2117240080122, 'SANJAY', 'S', 'Day Scholar'),
    (2117240080123, 'SANJAY KUMAR', 'M P', 'Hosteller'),
    (2117240080124, 'SANTHOSH', 'M N', 'Hosteller'),
    (2117240080125, 'SARAN', 'S', 'Day Scholar'),
    (2117240080126, 'SARATH', 'S D', 'Day Scholar'),
    (2117240080127, 'SESHARENGAN', 'S', 'Hosteller'),
    (2117240080128, 'SHALINI', 'C', 'Day Scholar'),
    (2117240080129, 'SHANTANU', 'DEGAPUDI', 'Day Scholar'),
    (2117240080130, 'SHANTHINI', 'C', 'Hosteller'),
    (2117240080131, 'SHARAN KUMAR', 'H', 'Day Scholar'),
    (2117240080132, 'SHARANYA', 'M', 'Day Scholar'),
    (2117240080133, 'SHARUKESHWARAN', 'V', 'Day Scholar'),
    (2117240080134, 'SHEIK ABDUL KHADER', 'T', 'Hosteller'),
    (2117240080135, 'SHESHIKA', 'P T', 'Hosteller'),
    (2117240080136, 'SHIVA', 'K', 'Day Scholar'),
    (2117240080137, 'SHREYA', 'S', 'Day Scholar'),
    (2117240080138, 'SHRUDHI', 'K H', 'Day Scholar'),
    (2117240080139, 'SHRUTHILAYA', 'B', 'Day Scholar'),
    (2117240080140, 'SIDDHARTHAA', 'S', 'Day Scholar'),
    (2117240080141, 'SOUNDARYA', 'S', 'Day Scholar'),
    (2117240080142, 'SREELEKSHMI', 'M', 'Day Scholar'),
    (2117240080143, 'SRI AKSHIYA', 'R', 'Hosteller'),
    (2117240080144, 'SRI AMUDHA VALLI', 'M', 'Day Scholar'),
    (2117240080145, 'SRIJAN', 'SAMANTA', 'Day Scholar'),
    (2117240080146, 'SRINITHA', 'M', 'Day Scholar'),
    (2117240080147, 'SRIRANJANI', 'NATARAJAN', 'Day Scholar'),
    (2117240080148, 'SRUTHI', 'K', 'Hosteller'),
    (2117240080149, 'SUDHARSHANA', 'V', 'Day Scholar'),
    (2117240080150, 'SUMETHA', 'V', 'Hosteller'),
    (2117240080151, 'SURUTHIKA', 'R', 'Hosteller'),
    (2117240080152, 'SURYA', 'M', 'Hosteller'),
    (2117240080153, 'SURYAPRAKASH', 'I', 'Hosteller'),
    (2117240080154, 'SUSEE', 'S', 'Hosteller'),
    (2117240080155, 'SWETHA', 'C', 'Hosteller'),
    (2117240080156, 'SYED KAREEMULLAH SHA', 'S', 'Day Scholar'),
    (2117240080157, 'TABITHA AEUGLE', 'C B', 'Day Scholar'),
    (2117240080158, 'TANU SREE', 'K', 'Hosteller'),
    (2117240080159, 'THARUN', 'P', 'Day Scholar'),
    (2117240080160, 'THIYANESWARAN', 'N', 'Hosteller'),
    (2117240080161, 'UGESH PRAAVIN', 'D', 'Day Scholar'),
    (2117240080162, 'VAISHNAVI', 'S', 'Day Scholar'),
    (2117240080163, 'VALLI MYLA', 'G', 'Hosteller'),
    (2117240080164, 'VETHANTH', 'S', 'Hosteller'),
    (2117240080165, 'VIJAY REDDY', 'S J', 'Day Scholar'),
    (2117240080166, 'VISHAL', 'V', 'Day Scholar'),
    (2117240080167, 'VISHNU PRIYA', 'L', 'Day Scholar'),
    (2117240080168, 'VISHWA', 'K', 'Hosteller'),
    (2117240080169, 'VISWAJITH', 'R S', 'Day Scholar'),
    (2117240080170, 'YAMINI', 'M', 'Day Scholar'),
    (2117240080171, 'YAMUNA', 'S', 'Hosteller'),
    (2117240080172, 'YOGASRI', 'J', 'Day Scholar'),
    (2117240080173, 'YOGEESHWAR', 'P', 'Day Scholar'),
    (2117240080174, 'YUGANDHAR', 'D', 'Hosteller'),
    (2117240080175, 'YUVANRAJ', 'N', 'Day Scholar'),
    (2117240080176, 'YUVARAJ', 'Y', 'Day Scholar'),
    (2117240080177, 'YUVASHREE', 'R', 'Day Scholar');

    -- Insert CSBS Students from Temporary Table
    SET i = 2117240080119;
    WHILE i <= 2117240080177 DO
        SELECT first_name, last_name, scholar_type INTO first_name_val, last_name_val, scholar_type_val 
        FROM temp_csbs_students WHERE reg_no = i;
        
        SET full_name_val = CONCAT(first_name_val, ' ', last_name_val);

        IF NOT EXISTS (SELECT 1 FROM users WHERE username = CAST(i AS CHAR)) THEN
            INSERT INTO users (username, password_hash, email, first_name, last_name, role_id, dept_id, account_status, must_change_password, failed_login_attempts, created_at, updated_at)
            VALUES (CAST(i AS CHAR), '$2a$10$8.UnVuG9HHgffUDAlk8UrOrpymLhnAkqi0WpOoL.JlXfJ4.iaNviG', CONCAT(i, '@ritchennai.edu.in'), first_name_val, last_name_val, @role_id, @csbs_id, 'active', 1, 0, NOW(), NOW());
            
            SET @user_id = LAST_INSERT_ID();
            
            INSERT INTO students (user_id, register_no, student_id_number, student_name, section, `batch`, `year`, `status`, department_id, scholar_type, email, created_at, updated_at)
            VALUES (@user_id, CAST(i AS CHAR), CONCAT('24CSBS', RIGHT(CAST(i AS CHAR), 3)), full_name_val, 'CSBS-C', '2024-2028', 1, 'active', @csbs_id, scholar_type_val, CONCAT(i, '@ritchennai.edu.in'), NOW(), NOW());
            
            UPDATE users SET linked_student_id = LAST_INSERT_ID() WHERE user_id = @user_id;
        END IF;
        SET i = i + 1;
    END WHILE;
    
    DROP TEMPORARY TABLE temp_csbs_students;
END //
DELIMITER ;

CALL SeedStudents();
DROP PROCEDURE SeedStudents;
