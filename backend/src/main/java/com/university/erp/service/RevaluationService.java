package com.university.erp.service;

import com.university.erp.exception.ErpException;
import com.university.erp.model.RevaluationRequest;
import com.university.erp.model.Marks;
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
    public void applyForRevaluation(@org.springframework.lang.NonNull RevaluationRequest request) {
        java.util.Objects.requireNonNull(request, "request must not be null");
        request.setStatus(RevaluationRequest.RequestStatus.PENDING);
        revaluationRepository.save(request);
        auditService.log("REVALUATION_APPLIED", "Student applied for revaluation ID: " + request.getId());
    }

    @Transactional
    public void approveByAdmin(@org.springframework.lang.NonNull Long requestId, String remarks) {
        java.util.Objects.requireNonNull(requestId, "requestId must not be null");
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));
        request.setStatus(RevaluationRequest.RequestStatus.ADMIN_APPROVED);
        request.setAdminRemarks(remarks);
        revaluationRepository.save(request);
    }

    @Transactional
    public void updateMarksByFaculty(@org.springframework.lang.NonNull Long requestId, Double newInternal, Double newExternal) {
        java.util.Objects.requireNonNull(requestId, "requestId must not be null");
        java.util.Objects.requireNonNull(newInternal, "newInternal must not be null");
        java.util.Objects.requireNonNull(newExternal, "newExternal must not be null");
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RevaluationRequest.RequestStatus.ADMIN_APPROVED) {
            throw new ErpException.InvalidOperationException("Request not yet approved by Admin/HOD");
        }

        Marks marks = request.getOriginalMarks();
        marks.setCalculatedInternal(newInternal.doubleValue());
        marks.setFinalExamScore(newExternal.doubleValue());

        calculationService.calculateFinalConverted(marks);
        calculationService.calculateTotal(marks);
        calculationService.calculateGrade(marks);

        request.setStatus(RevaluationRequest.RequestStatus.FACULTY_UPDATED);
        revaluationRepository.save(request);

        java.util.Objects.requireNonNull(request.getStudent(), "student must not be null");
        academicService.recalculateCgpa(java.util.Objects.requireNonNull(request.getStudent().getId(), "student id must not be null"));
        auditService.log("REVALUATION_COMPLETED", "Marks updated for request ID: " + java.util.Objects.requireNonNull(requestId, "requestId must not be null"));
    }
}
