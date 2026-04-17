package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class TimetablePrintReadyReportDto {
    private Long departmentId;
    private String sectionScope;
    private String displayFormat;
    private Map<String, List<String>> classWiseReport;
    private Map<String, List<String>> facultyWiseReport;
}
