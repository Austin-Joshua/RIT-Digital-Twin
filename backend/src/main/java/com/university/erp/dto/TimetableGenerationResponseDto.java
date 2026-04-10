package com.university.erp.dto;

import com.university.erp.model.TimetableSlot;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TimetableGenerationResponseDto {
    private boolean success;
    private String message;
    private List<TimetableSlot> slots;
    private TimetableValidationReportDto validation;
}
