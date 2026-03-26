package com.university.erp.repository;

import com.university.erp.entity.PlacementApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, Long> {
    List<PlacementApplication> findByStudent_Id(Long studentId);
    List<PlacementApplication> findByOpportunity_Id(Long opportunityId);
}
