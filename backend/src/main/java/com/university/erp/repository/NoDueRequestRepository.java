package com.university.erp.repository;

import com.university.erp.model.NoDueRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoDueRequestRepository extends JpaRepository<NoDueRequest, Long> {
    List<NoDueRequest> findByStudent_Id(Long studentId);
    List<NoDueRequest> findByStatusIgnoreCase(String status);
    Optional<NoDueRequest> findByStudent_IdAndClearanceTypeIgnoreCase(Long studentId, String clearanceType);
    Optional<NoDueRequest> findByStudent_IdAndClearanceDefinition_Id(Long studentId, Long clearanceDefinitionId);
    List<NoDueRequest> findByStudent_Department_IdAndStatusIgnoreCase(Long departmentId, String status);
    List<NoDueRequest> findByClearanceDefinition_AuthorityTypeIgnoreCaseAndStatusIgnoreCase(String authorityType, String status);
    boolean existsByStudent_IdAndClearanceTypeIgnoreCaseAndStatus(Long studentId, String clearanceType, String status);
    boolean existsByStudent_IdAndClearanceDefinition_IdAndStatus(Long studentId, Long clearanceDefinitionId, String status);
}
