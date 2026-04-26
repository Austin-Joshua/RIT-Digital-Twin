package com.university.erp.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ClassroomBookingRequestDto {
    @NotNull
    private Long classroomId;
    @NotNull
    @FutureOrPresent
    private LocalDate date;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
    @NotBlank
    private String purpose;
    private String courseCode;
}
