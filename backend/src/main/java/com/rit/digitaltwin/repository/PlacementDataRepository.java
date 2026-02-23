package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.PlacementData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlacementDataRepository extends JpaRepository<PlacementData, Long> {
    Optional<PlacementData> findByStudentId(Long studentId);
}
