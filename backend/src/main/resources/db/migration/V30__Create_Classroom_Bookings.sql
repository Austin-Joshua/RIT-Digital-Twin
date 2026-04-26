CREATE TABLE IF NOT EXISTS classroom_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    classroom_id BIGINT NOT NULL,
    booked_by BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT,
    course_code VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_classroom_bookings_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_classroom_bookings_user FOREIGN KEY (booked_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_classroom_bookings_slot (classroom_id, booking_date, start_time, end_time),
    INDEX idx_classroom_bookings_user (booked_by)
);
