-- V37: Clearance Definitions and Hardened No Due Subsystem
-- Database Authoritative Model for Institutional Clearances and Zero Synthetic IDs

CREATE TABLE IF NOT EXISTS clearance_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    authority_type VARCHAR(50) NOT NULL,
    department_id BIGINT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clearance_active (active),
    INDEX idx_clearance_authority (authority_type),
    INDEX idx_clearance_dept (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Authoritative Institutional Clearance Definitions
INSERT INTO clearance_definitions (code, name, description, authority_type, department_id, active, display_order)
VALUES 
('ND_LIB', 'Library & Resource Center', 'Central Library book returns and fee dues', 'LIBRARY', NULL, TRUE, 1),
('ND_LAB', 'Department Computer Laboratories', 'Departmental laboratory equipment and workstation clearance', 'LAB', NULL, TRUE, 2),
('ND_HOSTEL', 'Hostel & Residential Office', 'Hostel room inspection, mess dues, and asset clearance', 'HOSTEL', NULL, TRUE, 3),
('ND_FIN', 'Finance & Academic Accounts', 'Tuition, examination fees, and financial settlement clearance', 'FINANCE', NULL, TRUE, 4),
('ND_PLACE', 'Placement & Training Cell', 'Placement registration, corporate training, and interview clearance', 'PLACEMENT', NULL, TRUE, 5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Table for No Due Requests
CREATE TABLE IF NOT EXISTS no_due_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    clearance_definition_id BIGINT NULL,
    clearance_type VARCHAR(100) NOT NULL,
    subject_code VARCHAR(50) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    previous_status VARCHAR(50) NULL,
    remarks TEXT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME NULL,
    rejected_at DATETIME NULL,
    approved_by BIGINT NULL,
    rejected_by BIGINT NULL,
    ip_address VARCHAR(100) NULL,
    CONSTRAINT fk_no_due_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_no_due_clearance_def FOREIGN KEY (clearance_definition_id) REFERENCES clearance_definitions(id) ON DELETE SET NULL,
    CONSTRAINT fk_no_due_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_no_due_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_no_due_student (student_id),
    INDEX idx_no_due_status (status),
    INDEX idx_no_due_def (clearance_definition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
