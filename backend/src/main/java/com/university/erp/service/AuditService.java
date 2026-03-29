package com.university.erp.service;

import com.university.erp.model.AuditLog;
import com.university.erp.model.User;
import com.university.erp.repository.AuditLogRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String details) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        AuditLog log = AuditLog.builder()
                .actor(user)
                .action(action)
                .actionTime(java.time.LocalDateTime.now())
                .details(details)
                .build();
        java.util.Objects.requireNonNull(log, "log entry must not be null");
        auditLogRepository.save(log);
    }
}
