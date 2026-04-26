package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableSlotViewDto {
    private Long id;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String section;
    private TimetableSlotSubjectViewDto subject;
    private TimetableSlotFacultyViewDto faculty;
}
