package com.university.erp.repository;

import com.university.erp.model.SecurityAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {
    List<SecurityAlert> findTop50ByOrderByCreatedAtDesc();
    long countByResolvedFalse();
    long countBySeverityIgnoreCaseAndResolvedFalse(String severity);
}
