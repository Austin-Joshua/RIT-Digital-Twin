package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Building;
import com.rit.digitaltwin.model.BuildingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    Optional<Building> findByCode(String code);

    List<Building> findByType(BuildingType type);

    @Query("SELECT b FROM Building b LEFT JOIN FETCH b.classrooms WHERE b.id = :id")
    Optional<Building> findByIdWithClassrooms(Long id);

    @Query("SELECT COUNT(c) FROM Classroom c WHERE c.building.id = :buildingId")
    Long countClassroomsByBuildingId(Long buildingId);
}
