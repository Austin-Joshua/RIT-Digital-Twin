package com.university.erp.repository;

import com.university.erp.model.RevaluationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevaluationRepository extends JpaRepository<RevaluationRequest, Long> {
}
