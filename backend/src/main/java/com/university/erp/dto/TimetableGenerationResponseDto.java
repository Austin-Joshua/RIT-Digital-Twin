package com.university.erp.dto;

import com.university.erp.model.TimetableSlot;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class TimetableGenerationResponseDto {
    private boolean success;
    private String message;
    private List<TimetableSlot> slots;
    private TimetableValidationReportDto validation;
    private Map<String, List<TimetableMatrixEntryDto>> classWiseTimetable;
    private Map<String, List<TimetableMatrixEntryDto>> facultyWiseTimetable;
}
