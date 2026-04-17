package com.university.erp.service;

import com.university.erp.dto.SecuritySystemReportDto;
import com.university.erp.model.SecurityAlert;
import com.university.erp.repository.AccessActivityLogRepository;
import com.university.erp.repository.DataChangeAuditLogRepository;
import com.university.erp.repository.SecurityAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class SecureDataPlatformService {

    private final DataChangeAuditLogRepository dataChangeAuditLogRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final AccessActivityLogRepository accessActivityLogRepository;

    public SecureDataPlatformService(
            DataChangeAuditLogRepository dataChangeAuditLogRepository,
            SecurityAlertRepository securityAlertRepository,
            AccessActivityLogRepository accessActivityLogRepository
    ) {
        this.dataChangeAuditLogRepository = dataChangeAuditLogRepository;
        this.securityAlertRepository = securityAlertRepository;
        this.accessActivityLogRepository = accessActivityLogRepository;
    }

    @Transactional(readOnly = true)
    public SecuritySystemReportDto getSystemReport() {
        List<Map<String, Object>> latestAlerts = securityAlertRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(this::toAlertView)
                .toList();
        return SecuritySystemReportDto.builder()
                .totalTamperFlags(dataChangeAuditLogRepository.countByTamperingDetectedTrue())
                .unresolvedAlerts(securityAlertRepository.countByResolvedFalse())
                .criticalAlerts(securityAlertRepository.countBySeverityIgnoreCaseAndResolvedFalse("CRITICAL"))
                .maskedIpSessions(accessActivityLogRepository.countByMaskedIpSuspectedTrue())
                .highRiskActivities(accessActivityLogRepository.countByRiskLevelIgnoreCase("HIGH"))
                .cacheFirstEnabled(true)
                .cacheTtlMinutes(30)
                .latestAlerts(latestAlerts)
                .build();
    }

    private Map<String, Object> toAlertView(SecurityAlert alert) {
        return Map.of(
                "id", alert.getId(),
                "severity", alert.getSeverity(),
                "type", alert.getAlertType(),
                "userId", alert.getUserIdRef(),
                "ip", alert.getIpAddress(),
                "action", alert.getActionName(),
                "message", alert.getMessage(),
                "changedValues", alert.getChangedValues() == null ? "{}" : alert.getChangedValues(),
                "resolved", alert.isResolved(),
                "createdAt", String.valueOf(alert.getCreatedAt())
        );
    }
}
