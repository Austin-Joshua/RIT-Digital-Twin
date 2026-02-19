package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.CrowdData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrowdDataRepository extends JpaRepository<CrowdData, Long> {
    List<CrowdData> findByBuilding_BuildingId(Long buildingId);
}
