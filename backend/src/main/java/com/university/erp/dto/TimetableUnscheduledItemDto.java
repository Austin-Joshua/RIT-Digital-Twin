package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableUnscheduledItemDto {
    private String section;
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private String facultyName;
    private int requiredPeriods;
    private int scheduledPeriods;
    private String reason;
}
