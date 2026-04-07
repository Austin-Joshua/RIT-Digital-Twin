package com.university.erp.controller;

import com.university.erp.model.CertificateRequest;
import com.university.erp.repository.CertificateRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    private final CertificateRequestRepository certificateRequestRepository;

    public WorkflowController(CertificateRequestRepository certificateRequestRepository) {
        this.certificateRequestRepository = certificateRequestRepository;
    }

    @GetMapping("/certificates/{studentId}")
    public ResponseEntity<List<CertificateRequest>> getCertificates(@PathVariable Long studentId) {
        return ResponseEntity.ok(certificateRequestRepository.findByStudentId(studentId));
    }

    @PostMapping("/certificates/request/{studentId}")
    public ResponseEntity<CertificateRequest> requestCertificate(
            @PathVariable Long studentId,
            @RequestParam String type) {
        
        CertificateRequest request = CertificateRequest.builder()
                .studentId(studentId)
                .certificateType(type)
                .status("APPROVED") // Auto-approving for demo purposes
                .pdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf") // Mock PDF
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return ResponseEntity.ok(certificateRequestRepository.save(request));
    }
}
