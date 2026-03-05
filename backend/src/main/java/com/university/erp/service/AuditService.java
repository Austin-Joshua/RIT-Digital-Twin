package com.university.erp.service;

import com.university.erp.entity.AuditLog;
import com.university.erp.entity.User;
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
                .userId(user.getUserId())
                .role(user.getRole().getRoleName().name())
                .action(action)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getDeptId() : null)
                .details(details)
                .build();
        java.util.Objects.requireNonNull(log, "log entry must not be null");
        auditLogRepository.save(log);
    }
}
