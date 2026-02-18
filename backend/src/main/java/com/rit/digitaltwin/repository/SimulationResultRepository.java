package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SimulationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {
}
