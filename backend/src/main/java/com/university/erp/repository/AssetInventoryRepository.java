package com.university.erp.repository;

import com.university.erp.model.AssetInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetInventoryRepository extends JpaRepository<AssetInventory, Long> {
}
