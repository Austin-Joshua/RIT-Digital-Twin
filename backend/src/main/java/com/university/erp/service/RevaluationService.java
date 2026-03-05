package com.university.erp.service;

import com.university.erp.exception.ErpException;
import com.university.erp.entity.RevaluationRequest;
import com.university.erp.entity.Marks;
import com.university.erp.repository.RevaluationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RevaluationService {

    private final RevaluationRepository revaluationRepository;
    private final AcademicService academicService;
    private final AuditService auditService;
    private final InternalMarkCalculationService calculationService;

    public RevaluationService(RevaluationRepository revaluationRepository,
            AcademicService academicService, AuditService auditService,
            InternalMarkCalculationService calculationService) {
        this.revaluationRepository = revaluationRepository;
        this.academicService = academicService;
        this.auditService = auditService;
        this.calculationService = calculationService;
    }

    @Transactional
    public void applyForRevaluation(RevaluationRequest request) {
        request.setStatus(RevaluationRequest.RequestStatus.PENDING);
        revaluationRepository.save(request);
        auditService.log("REVALUATION_APPLIED", "Student applied for revaluation ID: " + request.getId());
    }

    @Transactional
    public void approveByAdmin(Long requestId, String remarks) {
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));
        request.setStatus(RevaluationRequest.RequestStatus.ADMIN_APPROVED);
        request.setAdminRemarks(remarks);
        revaluationRepository.save(request);
    }

    @Transactional
    public void approveByHod(Long requestId, String remarks) {
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RevaluationRequest.RequestStatus.ADMIN_APPROVED) {
            throw new ErpException.InvalidOperationException("Request must be admin-approved before HOD review.");
        }

        request.setStatus(RevaluationRequest.RequestStatus.HOD_APPROVED);
        request.setHodRemarks(remarks);
        revaluationRepository.save(request);
        auditService.log("REVALUATION_HOD_APPROVED", "HOD approved revaluation ID: " + requestId);
    }

    @Transactional
    public void updateMarksByFaculty(Long requestId, java.math.BigDecimal newInternal,
            java.math.BigDecimal newExternal) {
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RevaluationRequest.RequestStatus.HOD_APPROVED) {
            throw new ErpException.InvalidOperationException("Request not yet approved by Admin and HOD");
        }

        Marks marks = request.getOriginalMarks();
        marks.setCalculatedInternal(newInternal);
        marks.setFinalExamScore(newExternal);

        calculationService.calculateFinalConverted(marks);
        calculationService.calculateTotal(marks);
        calculationService.calculateGrade(marks);

        request.setStatus(RevaluationRequest.RequestStatus.FACULTY_UPDATED);
        revaluationRepository.save(request);

        academicService.recalculateCgpa(request.getStudent().getId());
        auditService.log("REVALUATION_COMPLETED", "Marks updated for request ID: " + requestId);
    }

    @Transactional
    public void finalizeByHod(Long requestId, String remarks) {
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RevaluationRequest.RequestStatus.FACULTY_UPDATED) {
            throw new ErpException.InvalidOperationException("Faculty must update marks before HOD finalization.");
        }

        request.setHodRemarks(remarks);
        revaluationRepository.save(request);
        auditService.log("REVALUATION_HOD_FINALIZED", "HOD finalized revaluation ID: " + requestId);
    }

    @Transactional
    public void finalizeByAdmin(Long requestId, String remarks) {
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RevaluationRequest.RequestStatus.FACULTY_UPDATED
                && request.getStatus() != RevaluationRequest.RequestStatus.HOD_APPROVED) {
            throw new ErpException.InvalidOperationException("Request must be updated by faculty before admin closure.");
        }

        request.setAdminRemarks(remarks);
        request.setStatus(RevaluationRequest.RequestStatus.COMPLETED);
        revaluationRepository.save(request);
        academicService.recalculateCgpa(request.getStudent().getId());
        auditService.log("REVALUATION_ADMIN_CLOSED", "Admin closed revaluation ID: " + requestId);
    }
}
