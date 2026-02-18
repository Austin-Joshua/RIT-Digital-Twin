package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.EnergyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnergyLogRepository extends JpaRepository<EnergyLog, Long> {
    List<EnergyLog> findByBuildingId(Long buildingId);
}
