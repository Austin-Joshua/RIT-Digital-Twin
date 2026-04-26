package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "classroom_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class ClassroomBooking extends BaseEntity {

    public enum BookingStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booked_by", nullable = false)
    private User bookedBy;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(name = "course_code", length = 30)
    private String courseCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;
}
