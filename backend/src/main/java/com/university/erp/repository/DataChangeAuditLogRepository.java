package com.university.erp.repository;

import com.university.erp.model.DataChangeAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DataChangeAuditLogRepository extends JpaRepository<DataChangeAuditLog, Long> {
    Optional<DataChangeAuditLog> findTopByEntityTypeAndEntityIdAndStageOrderByCreatedAtDesc(String entityType, String entityId, String stage);
    List<DataChangeAuditLog> findTop20ByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
    long countByTamperingDetectedTrue();
}
