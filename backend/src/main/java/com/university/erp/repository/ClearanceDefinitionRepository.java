package com.university.erp.repository;

import com.university.erp.model.ClearanceDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClearanceDefinitionRepository extends JpaRepository<ClearanceDefinition, Long> {
    List<ClearanceDefinition> findByActiveTrueOrderByDisplayOrderAsc();
    Optional<ClearanceDefinition> findByCodeIgnoreCase(String code);
    Optional<ClearanceDefinition> findByNameIgnoreCase(String name);
    List<ClearanceDefinition> findByAuthorityTypeIgnoreCase(String authorityType);
    List<ClearanceDefinition> findByDepartment_Id(Long departmentId);
}
