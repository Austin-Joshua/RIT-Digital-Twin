ALTER TABLE faculty_subjects
    ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN IF NOT EXISTS requested_by_user_id BIGINT NULL,
    ADD COLUMN IF NOT EXISTS approved_by_user_id BIGINT NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;

UPDATE faculty_subjects
SET approval_status = 'APPROVED'
WHERE approval_status IS NULL OR approval_status = '';

ALTER TABLE faculty_subjects
    ADD CONSTRAINT fk_fac_sub_requested_by
        FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE faculty_subjects
    ADD CONSTRAINT fk_fac_sub_approved_by
        FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

CREATE INDEX idx_fac_sub_approval_status ON faculty_subjects (approval_status);
CREATE INDEX idx_fac_sub_approval_dept_section ON faculty_subjects (approval_status, section);
