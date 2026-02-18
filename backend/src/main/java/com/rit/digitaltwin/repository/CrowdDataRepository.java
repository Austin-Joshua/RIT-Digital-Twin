package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.CrowdData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CrowdDataRepository extends JpaRepository<CrowdData, Long> {

    List<CrowdData> findByZoneNameOrderByRecordedAtDesc(String zoneName);

    List<CrowdData> findByRecordedAtBetween(LocalDateTime start, LocalDateTime end);

    List<CrowdData> findByIsEmergencyTrue();

    @Query("SELECT c FROM CrowdData c WHERE c.densityLevel = 'CRITICAL' ORDER BY c.recordedAt DESC")
    List<CrowdData> findCriticalZones();
}
