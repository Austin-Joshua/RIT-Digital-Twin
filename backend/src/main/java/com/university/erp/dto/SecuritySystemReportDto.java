package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class SecuritySystemReportDto {
    private long totalTamperFlags;
    private long unresolvedAlerts;
    private long criticalAlerts;
    private long maskedIpSessions;
    private long highRiskActivities;
    private boolean cacheFirstEnabled;
    private int cacheTtlMinutes;
    private List<Map<String, Object>> latestAlerts;
}
