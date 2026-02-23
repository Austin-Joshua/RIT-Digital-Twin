package com.university.erp.service;

import com.university.erp.exception.ErpException;
import com.university.erp.model.RevaluationRequest;
import com.university.erp.repository.RevaluationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RevaluationService {

    private final RevaluationRepository revaluationRepository;
    private final AcademicService academicService;
    private final AuditService auditService;

    public RevaluationService(RevaluationRepository revaluationRepository,
            AcademicService academicService, AuditService auditService) {
        this.revaluationRepository = revaluationRepository;
        this.academicService = academicService;
        this.auditService = auditService;
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
    public void updateMarksByFaculty(Long requestId, Integer newInternal, Integer newExternal) {
        RevaluationRequest request = revaluationRepository.findById(requestId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RevaluationRequest.RequestStatus.ADMIN_APPROVED) {
            throw new ErpException.InvalidOperationException("Request not yet approved by Admin/HOD");
        }

        request.getOriginalMarks().setInternalMarks(newInternal);
        request.getOriginalMarks().setExternalMarks(newExternal);
        request.getOriginalMarks().setTotalMarks(newInternal + newExternal);
        // Recalculate grade logic could go here

        request.setStatus(RevaluationRequest.RequestStatus.FACULTY_UPDATED);
        revaluationRepository.save(request);

        academicService.recalculateCgpa(request.getStudent().getId());
        auditService.log("REVALUATION_COMPLETED", "Marks updated for request ID: " + requestId);
    }
}
