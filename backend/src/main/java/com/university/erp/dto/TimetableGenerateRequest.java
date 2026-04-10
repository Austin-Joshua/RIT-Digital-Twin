package com.university.erp.dto;

import lombok.Data;

import java.util.List;

@Data
public class TimetableGenerateRequest {
    private Long deptId;
    private String section; // Legacy single-section support
    private List<String> sections;
    private Integer semesterNumber;
    private Integer daysPerWeek;
    private Integer periodsPerDay;
    private Integer periodDurationMinutes;
    private Boolean strictMode;
}
