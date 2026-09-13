package com.university.erp.controller;

import com.university.erp.model.CertificateRequest;
import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.CertificateRequestRepository;
import com.university.erp.service.CertificateReview;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    private final CertificateRequestRepository certificateRequestRepository;

    public WorkflowController(CertificateRequestRepository certificateRequestRepository) {
        this.certificateRequestRepository = certificateRequestRepository;
    }

    @GetMapping("/certificates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CertificateRequest>> certificateQueue() {
        return ResponseEntity.ok(certificateRequestRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/certificates/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CertificateRequest> reviewCertificate(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        CertificateRequest request = certificateRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate request was not found."));
        String decision;
        try {
            decision = CertificateReview.decide(request.getStatus(), body.get("status") == null ? "" : String.valueOf(body.get("status")));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
        }
        request.setStatus(decision);
        request.setPdfUrl(null);
        request.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(certificateRequestRepository.save(request));
    }

    @GetMapping("/certificates/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CertificateRequest>> getCertificates(
            @PathVariable Long studentId,
            Authentication authentication) {
        assertOwnRecord(studentId, authentication);
        return ResponseEntity.ok(certificateRequestRepository.findByStudentId(studentId));
    }

    @PostMapping("/certificates/request/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CertificateRequest> requestCertificate(
            @PathVariable Long studentId,
            @RequestParam String type,
            Authentication authentication) {
        assertOwnRecord(studentId, authentication);
        if (type == null || type.isBlank() || type.length() > 40) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certificate type is required.");
        }

        CertificateRequest request = CertificateRequest.builder()
                .studentId(studentId)
                .certificateType(type.trim())
                .status("REQUESTED")
                .pdfUrl(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(certificateRequestRepository.save(request));
    }

    private static void assertOwnRecord(Long studentId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user) || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Certificate records are limited to the signed-in student.");
        }
        boolean admin = user.getRole() != null && user.getRole().getRoleName() == Role.UserRole.ADMIN;
        if (!admin && !user.getId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Certificate records are limited to the signed-in student.");
        }
    }
}
