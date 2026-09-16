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
}
