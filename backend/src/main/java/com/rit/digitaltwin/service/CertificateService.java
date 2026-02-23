package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRequestRepository certificateRequestRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public CertificateRequest requestCertificate(Long studentId, CertificateRequest.CertificateType type) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        CertificateRequest request = CertificateRequest.builder()
                .student(student)
                .type(type)
                .status(CertificateRequest.RequestStatus.PENDING)
                .build();

        return certificateRequestRepository.save(request);
    }

    @Transactional
    public CertificateRequest approveCertificate(Long requestId) {
        CertificateRequest request = certificateRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(CertificateRequest.RequestStatus.GENERATED);
        // Mocking PDF generation path
        request.setFilePath("/certificates/generated/" + request.getType() + "_" + requestId + ".pdf");

        return certificateRequestRepository.save(request);
    }

    public List<CertificateRequest> getStudentRequests(Long studentId) {
        return certificateRequestRepository.findByStudentStudentId(studentId);
    }

    public List<CertificateRequest> getPendingRequests() {
        return certificateRequestRepository.findByStatus(CertificateRequest.RequestStatus.PENDING);
    }
}
