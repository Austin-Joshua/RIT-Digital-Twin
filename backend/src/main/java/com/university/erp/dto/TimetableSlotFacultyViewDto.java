package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableSlotFacultyViewDto {
    private TimetableSlotFacultyUserViewDto user;
}
