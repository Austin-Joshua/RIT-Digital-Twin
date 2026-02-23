package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.AuditLog;
import com.rit.digitaltwin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String userEmail, String action, String entity, String entityId, String details) {
        AuditLog log = AuditLog.builder()
                .userEmail(userEmail)
                .actionType(action)
                .entityName(entity)
                .entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
