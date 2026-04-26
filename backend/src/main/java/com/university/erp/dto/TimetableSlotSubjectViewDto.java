package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableSlotSubjectViewDto {
    private Long id;
    private String subjectName;
    private String subjectCode;
    private Integer credits;
    private String regulation;
}
