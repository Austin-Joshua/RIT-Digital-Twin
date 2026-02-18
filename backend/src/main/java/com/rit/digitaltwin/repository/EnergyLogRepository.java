package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.EnergyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EnergyLogRepository extends JpaRepository<EnergyLog, Long> {

    List<EnergyLog> findByBuildingIdAndReadingDate(Long buildingId, LocalDate date);

    @Query("SELECT e FROM EnergyLog e JOIN FETCH e.building WHERE e.readingDate = :date ORDER BY e.building.id, e.readingHour")
    List<EnergyLog> findAllByDate(@Param("date") LocalDate date);

    @Query("SELECT e FROM EnergyLog e JOIN FETCH e.building WHERE e.readingDate BETWEEN :startDate AND :endDate ORDER BY e.readingDate, e.readingHour")
    List<EnergyLog> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM EnergyLog e JOIN FETCH e.building WHERE e.building.id = :buildingId AND e.readingDate BETWEEN :startDate AND :endDate ORDER BY e.readingDate, e.readingHour")
    List<EnergyLog> findByBuildingAndDateRange(@Param("buildingId") Long buildingId,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.consumptionKwh), 0) FROM EnergyLog e WHERE e.readingDate BETWEEN :startDate AND :endDate")
    Double sumConsumptionByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.solarGenerationKwh), 0) FROM EnergyLog e WHERE e.readingDate BETWEEN :startDate AND :endDate")
    Double sumSolarByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
