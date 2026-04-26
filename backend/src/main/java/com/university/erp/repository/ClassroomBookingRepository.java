package com.university.erp.repository;

import com.university.erp.model.ClassroomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ClassroomBookingRepository extends JpaRepository<ClassroomBooking, Long> {
    List<ClassroomBooking> findByBookedBy_UserId(Long userId);

    @Query("""
            SELECT b FROM ClassroomBooking b
            WHERE b.classroom.id = :classroomId
              AND b.bookingDate = :bookingDate
              AND b.status <> com.university.erp.model.ClassroomBooking$BookingStatus.CANCELLED
              AND b.status <> com.university.erp.model.ClassroomBooking$BookingStatus.REJECTED
              AND ((b.startTime <= :endTime AND b.endTime >= :startTime))
            """)
    List<ClassroomBooking> findConflictingBookings(Long classroomId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime);
}
