package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.model.SimulationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {

    List<SimulationResult> findBySimulationTypeOrderByCreatedAtDesc(SimulationType type);

    List<SimulationResult> findTop10BySimulationTypeOrderByCreatedAtDesc(SimulationType type);
}
