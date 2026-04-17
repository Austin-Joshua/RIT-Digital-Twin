package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableGeneratorAccessDto {
    private boolean canGenerate;
    private String configuredFacultyUsername;
    private String message;
}
