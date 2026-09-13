package com.university.erp.repository;

import com.university.erp.model.CampusDecision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampusDecisionRepository extends JpaRepository<CampusDecision, Long> {
    List<CampusDecision> findTop20ByOrderByAuthorizedAtDesc();
}
