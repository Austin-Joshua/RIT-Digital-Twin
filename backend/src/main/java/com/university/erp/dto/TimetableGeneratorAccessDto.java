package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TimetableGeneratorAccessDto {
    private boolean canGenerate;
    private String configuredFacultyUsername;
    private String message;
    private Long allowedDepartmentId;
    private String allowedDepartmentCode;
    private List<String> availableSections;
    private List<String> supportedModes;
}
