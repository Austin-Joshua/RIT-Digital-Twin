package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.CertificateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRequestRepository extends JpaRepository<CertificateRequest, Long> {
    List<CertificateRequest> findByStudentId(Long studentId);

    List<CertificateRequest> findByStatus(CertificateRequest.RequestStatus status);
}
