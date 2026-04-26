package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class ClassroomAvailabilityDto {
    private Long classroomId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
    private List<ClassroomBookingDto> conflictingBookings;
}
