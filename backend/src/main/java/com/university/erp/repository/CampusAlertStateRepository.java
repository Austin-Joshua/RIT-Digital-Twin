package com.university.erp.repository;

import com.university.erp.model.CampusAlertState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CampusAlertStateRepository extends JpaRepository<CampusAlertState, Long> {
    Optional<CampusAlertState> findByAlertKey(String alertKey);
}
