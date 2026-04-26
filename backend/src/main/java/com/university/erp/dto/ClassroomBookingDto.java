package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ClassroomBookingDto {
    private Long id;
    private Long classroomId;
    private String roomName;
    private String bookedBy;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private String courseCode;
    private String status;
}
