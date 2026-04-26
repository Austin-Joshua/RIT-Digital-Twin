package com.university.erp.service;

import com.university.erp.dto.ClassroomAvailabilityDto;
import com.university.erp.dto.ClassroomBookingDto;
import com.university.erp.dto.ClassroomBookingRequestDto;
import com.university.erp.dto.ClassroomDto;
import com.university.erp.model.Classroom;
import com.university.erp.model.ClassroomBooking;
import com.university.erp.model.User;
import com.university.erp.repository.ClassroomBookingRepository;
import com.university.erp.repository.ClassroomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ClassroomBookingService {
    private final ClassroomRepository classroomRepository;
    private final ClassroomBookingRepository bookingRepository;

    public ClassroomBookingService(ClassroomRepository classroomRepository, ClassroomBookingRepository bookingRepository) {
        this.classroomRepository = classroomRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ClassroomDto> getAllClassrooms(Integer minCapacity) {
        List<Classroom> rooms = (minCapacity != null && minCapacity > 0)
                ? classroomRepository.findByCapacityAtLeast(minCapacity)
                : classroomRepository.findAll();
        return rooms.stream().map(this::toClassroomDto).toList();
    }

    @Transactional(readOnly = true)
    public ClassroomAvailabilityDto checkAvailability(Long classroomId, LocalDate date, LocalTime start, LocalTime end) {
        List<ClassroomBooking> conflicts = bookingRepository.findConflictingBookings(classroomId, date, start, end);
        return ClassroomAvailabilityDto.builder()
                .classroomId(classroomId)
                .date(date)
                .startTime(start)
                .endTime(end)
                .available(conflicts.isEmpty())
                .conflictingBookings(conflicts.stream().map(this::toBookingDto).toList())
                .build();
    }

    @Transactional
    public ClassroomBookingDto createBooking(ClassroomBookingRequestDto request, User user) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time.");
        }
        List<ClassroomBooking> conflicts = bookingRepository.findConflictingBookings(
                request.getClassroomId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Selected slot is already booked.");
        }

        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found."));
        ClassroomBooking booking = ClassroomBooking.builder()
                .classroom(classroom)
                .bookedBy(user)
                .bookingDate(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .courseCode(request.getCourseCode())
                .status(ClassroomBooking.BookingStatus.PENDING)
                .build();
        return toBookingDto(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<ClassroomBookingDto> myBookings(Long userId) {
        return bookingRepository.findByBookedBy_UserId(userId).stream().map(this::toBookingDto).toList();
    }

    @Transactional
    public ClassroomBookingDto updateBookingStatus(Long bookingId, ClassroomBooking.BookingStatus status) {
        ClassroomBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));
        booking.setStatus(status);
        return toBookingDto(bookingRepository.save(booking));
    }

    private ClassroomDto toClassroomDto(Classroom classroom) {
        return ClassroomDto.builder()
                .id(classroom.getId())
                .name(classroom.getName())
                .buildingName(classroom.getBuilding() != null ? classroom.getBuilding().getName() : null)
                .capacity(classroom.getCapacity())
                .type(classroom.getType())
                .available(Boolean.TRUE)
                .build();
    }

    private ClassroomBookingDto toBookingDto(ClassroomBooking booking) {
        return ClassroomBookingDto.builder()
                .id(booking.getId())
                .classroomId(booking.getClassroom() != null ? booking.getClassroom().getId() : null)
                .roomName(booking.getClassroom() != null ? booking.getClassroom().getName() : null)
                .bookedBy(booking.getBookedBy() != null ? booking.getBookedBy().getUsername() : null)
                .date(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .courseCode(booking.getCourseCode())
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .build();
    }
}
