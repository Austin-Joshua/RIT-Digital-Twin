package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.CertificateRequest;
import com.rit.digitaltwin.model.PlacementData;
import com.rit.digitaltwin.model.ResultApproval;
import com.rit.digitaltwin.model.SubjectRegistration;
import com.rit.digitaltwin.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final SubjectRegistrationService subjectRegistrationService;
    private final CertificateRequestService certificateRequestService;
    private final ResultApprovalService resultApprovalService;
    private final PlacementDataService placementDataService;

    @GetMapping("/registrations/{studentId}")
    public ResponseEntity<List<SubjectRegistration>> getRegistrations(@PathVariable Long studentId) {
        return ResponseEntity.ok(subjectRegistrationService.getRegistrationsForStudent(studentId));
    }

    @PostMapping("/registrations/{studentId}/{subjectId}")
    public ResponseEntity<SubjectRegistration> registerSubject(@PathVariable Long studentId,
            @PathVariable Long subjectId) {
        return ResponseEntity.ok(subjectRegistrationService.createRegistration(studentId, subjectId));
    }

    @GetMapping("/certificates/{studentId}")
    public ResponseEntity<List<CertificateRequest>> getCertificates(@PathVariable Long studentId) {
        return ResponseEntity.ok(certificateRequestService.getRequestsByStudent(studentId));
    }

    @PostMapping("/certificates/request/{studentId}")
    public ResponseEntity<CertificateRequest> requestCertificate(@PathVariable Long studentId,
            @RequestParam CertificateRequest.CertificateType type) {
        return ResponseEntity.ok(certificateRequestService.createRequest(studentId, type));
    }

    @PostMapping("/certificates/approve/{requestId}")
    public ResponseEntity<CertificateRequest> approveCertificate(@PathVariable Long requestId) {
        return ResponseEntity.ok(certificateRequestService.approveRequestAndGeneratePdf(requestId));
    }

    @GetMapping("/results/{departmentId}/{semester}")
    public ResponseEntity<List<ResultApproval>> getResultApprovals(@PathVariable Long departmentId,
            @PathVariable Integer semester) {
        return ResponseEntity.ok(resultApprovalService.getApprovalsByDepartment(departmentId, semester));
    }

    @PostMapping("/results/upload")
    public ResponseEntity<ResultApproval> uploadResults(@RequestParam Long departmentId, @RequestParam Integer semester,
            @RequestParam String facultyEmail) {
        return ResponseEntity.ok(resultApprovalService.uploadMarksForApproval(departmentId, semester, facultyEmail));
    }

    @PostMapping("/results/publish/{approvalId}")
    public ResponseEntity<ResultApproval> publishResults(@PathVariable Long approvalId,
            @RequestParam String adminEmail) {
        return ResponseEntity.ok(resultApprovalService.publishResults(approvalId, adminEmail));
    }

    @GetMapping("/placement/{studentId}")
    public ResponseEntity<PlacementData> getPlacementData(@PathVariable Long studentId) {
        return ResponseEntity.ok(placementDataService.getPlacementDataForStudent(studentId));
    }

    @PutMapping("/placement/{studentId}")
    public ResponseEntity<PlacementData> updatePlacementData(@PathVariable Long studentId,
            @RequestBody PlacementData data) {
        return ResponseEntity.ok(placementDataService.updatePlacementData(studentId, data));
    }
}
