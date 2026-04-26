package com.university.erp.controller;

import com.university.erp.dto.ClassroomAvailabilityDto;
import com.university.erp.dto.ClassroomBookingDto;
import com.university.erp.dto.ClassroomBookingRequestDto;
import com.university.erp.dto.ClassroomDto;
import com.university.erp.model.ClassroomBooking;
import com.university.erp.model.User;
import com.university.erp.service.ClassroomBookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomBookingController {
    private final ClassroomBookingService classroomBookingService;

    public ClassroomBookingController(ClassroomBookingService classroomBookingService) {
        this.classroomBookingService = classroomBookingService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<List<ClassroomDto>> listClassrooms(@RequestParam(required = false) Integer minCapacity) {
        return ResponseEntity.ok(classroomBookingService.getAllClassrooms(minCapacity));
    }

    @GetMapping("/{classroomId}/availability")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<ClassroomAvailabilityDto> checkAvailability(
            @PathVariable Long classroomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime
    ) {
        return ResponseEntity.ok(classroomBookingService.checkAvailability(classroomId, date, startTime, endTime));
    }

    @PostMapping("/bookings")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<ClassroomBookingDto> createBooking(
            @Valid @RequestBody ClassroomBookingRequestDto request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(classroomBookingService.createBooking(request, user));
    }

    @GetMapping("/bookings/my")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<List<ClassroomBookingDto>> myBookings(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(classroomBookingService.myBookings(user.getUserId()));
    }

    @PutMapping("/bookings/{bookingId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<ClassroomBookingDto> updateStatus(
            @PathVariable Long bookingId,
            @RequestParam ClassroomBooking.BookingStatus status
    ) {
        return ResponseEntity.ok(classroomBookingService.updateBookingStatus(bookingId, status));
    }
}
