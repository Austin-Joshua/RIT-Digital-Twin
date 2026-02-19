package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    java.util.Optional<Building> findByCode(String code);
}
