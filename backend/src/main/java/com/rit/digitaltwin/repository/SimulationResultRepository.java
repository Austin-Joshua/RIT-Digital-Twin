package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.model.SimulationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {
    Page<SimulationResult> findBySimType(SimulationType simType, Pageable pageable);
}
