package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.CertificateRequest;
import com.rit.digitaltwin.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/academic/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping("/request")
    public ResponseEntity<CertificateRequest> requestCertificate(
            @RequestParam Long studentId,
            @RequestParam CertificateRequest.CertificateType type) {
        return ResponseEntity.ok(certificateService.requestCertificate(studentId, type));
    }

    @PostMapping("/approve/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CertificateRequest> approveCertificate(@PathVariable Long requestId) {
        return ResponseEntity.ok(certificateService.approveCertificate(requestId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CertificateRequest>> getStudentRequests(@PathVariable Long studentId) {
        return ResponseEntity.ok(certificateService.getStudentRequests(studentId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CertificateRequest>> getPendingRequests() {
        return ResponseEntity.ok(certificateService.getPendingRequests());
    }
}
