package com.university.erp.repository;

import com.university.erp.entity.PlacementOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlacementOpportunityRepository extends JpaRepository<PlacementOpportunity, Long> {
    List<PlacementOpportunity> findByStatus(String status);
}
