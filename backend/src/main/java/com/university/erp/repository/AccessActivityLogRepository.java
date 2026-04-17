package com.university.erp.repository;

import com.university.erp.model.AccessActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessActivityLogRepository extends JpaRepository<AccessActivityLog, Long> {
    long countByMaskedIpSuspectedTrue();
    long countByRiskLevelIgnoreCase(String riskLevel);
}
