package com.university.erp.repository;

import com.university.erp.model.CertificateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificateRequestRepository extends JpaRepository<CertificateRequest, Long> {
    List<CertificateRequest> findByStudentId(Long studentId);
}
