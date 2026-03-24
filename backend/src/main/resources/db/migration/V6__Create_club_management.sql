CREATE TABLE IF NOT EXISTS clubs (
    club_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(150) NOT NULL UNIQUE,
    description VARCHAR(600),
    category VARCHAR(80) NOT NULL,
    faculty_coordinator_id BIGINT NULL,
    contact_email VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_club_faculty_coordinator
        FOREIGN KEY (faculty_coordinator_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_club_membership (
    membership_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    club_id BIGINT NOT NULL,
    role_type VARCHAR(80) NOT NULL DEFAULT 'member',
    joined_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_club_student
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_club_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_club UNIQUE (student_id, club_id)
);

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'clubs' AND index_name = 'idx_club_status'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_club_status ON clubs(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'student_club_membership' AND index_name = 'idx_student_club_student_id'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_student_club_student_id ON student_club_membership(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'student_club_membership' AND index_name = 'idx_student_club_club_id'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_student_club_club_id ON student_club_membership(club_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'student_club_membership' AND index_name = 'idx_student_club_status'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_student_club_status ON student_club_membership(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO clubs (club_name, description, category, contact_email, status)
VALUES
    ('STEAM Club', 'Interdisciplinary innovation in science, technology, engineering, arts, and maths.', 'technical', 'steam@ritchennai.edu.in', 'active'),
    ('IoT Club', 'Hands-on projects in sensors, embedded systems, and smart campus automation.', 'technical', 'iotclub@ritchennai.edu.in', 'active'),
    ('CAM Club', 'Computer-aided modelling and manufacturing discussions and workshops.', 'technical', 'camclub@ritchennai.edu.in', 'active'),
    ('Techsparks Club', 'Student-led technology events, hackathons, and peer mentoring.', 'technical', 'techsparks@ritchennai.edu.in', 'active'),
    ('Language Club', 'Communication, debate, and multilingual proficiency initiatives.', 'language', 'languageclub@ritchennai.edu.in', 'active'),
    ('Maths Club', 'Problem solving circles, olympiad prep, and applied mathematics sessions.', 'technical', 'mathsclub@ritchennai.edu.in', 'active'),
    ('Rotaract Club', 'Community service and social impact initiatives with student leadership.', 'service', 'rotaract@ritchennai.edu.in', 'active'),
    ('YUVA Club', 'Youth leadership and civic engagement programmes for holistic growth.', 'service', 'yuva@ritchennai.edu.in', 'active'),
    ('Photography Club', 'Creative photography, media storytelling, and event documentation.', 'cultural', 'photography@ritchennai.edu.in', 'active'),
    ('Women Empowerment Club', 'Awareness, mentoring, and empowerment activities for inclusivity.', 'service', 'wec@ritchennai.edu.in', 'active')
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    category = VALUES(category),
    contact_email = VALUES(contact_email),
    status = VALUES(status);
