package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableMatrixEntryDto {
    private String day;
    private int period;
    private String startTime;
    private String endTime;
    private String section;
    private String subjectCode;
    private String subjectName;
    private String facultyName;
    private boolean freePeriod;
}
