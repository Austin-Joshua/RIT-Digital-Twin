package com.university.erp.controller;

import com.university.erp.dto.FacultyRevaluationUpdateDto;
import com.university.erp.dto.RevaluationRequestDto;
import com.university.erp.entity.Marks;
import com.university.erp.entity.RevaluationRequest;
import com.university.erp.entity.User;
import com.university.erp.exception.ErpException;
import com.university.erp.repository.MarksRepository;
import com.university.erp.service.RevaluationService;
import com.university.erp.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/revaluation")
public class RevaluationController {

    private final RevaluationService revaluationService;
    private final MarksRepository marksRepository;
    private final StudentProfileService studentProfileService;

    public RevaluationController(RevaluationService revaluationService,
                                 MarksRepository marksRepository,
                                 StudentProfileService studentProfileService) {
        this.revaluationService = revaluationService;
        this.marksRepository = marksRepository;
        this.studentProfileService = studentProfileService;
    }

    @PostMapping("/requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForRevaluation(@RequestBody RevaluationRequestDto payload) {
        Objects.requireNonNull(payload, "payload must not be null");
        Objects.requireNonNull(payload.getMarksId(), "marksId must not be null");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Objects.requireNonNull(authentication, "authentication must not be null");
        User currentUser = (User) authentication.getPrincipal();

        com.university.erp.entity.Student student = studentProfileService.getByUserId(currentUser.getId());

        Marks marks = marksRepository.findById(payload.getMarksId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Marks record not found"));

        if (!marks.getStudent().getId().equals(student.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot request revaluation for another student.");
        }

        RevaluationRequest request = RevaluationRequest.builder()
                .student(student)
                .subject(marks.getSubject())
                .originalMarks(marks)
                .reason(payload.getReason())
                .status(RevaluationRequest.RequestStatus.PENDING)
                .build();

        revaluationService.applyForRevaluation(request);
        return ResponseEntity.ok(Map.of("message", "Revaluation request submitted successfully.", "requestId", request.getId()));
    }

    @PostMapping("/requests/{id}/admin-approve")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> adminApprove(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        revaluationService.approveByAdmin(id, remarks);
        return ResponseEntity.ok(Map.of("message", "Revaluation request admin-approved."));
    }

    @PostMapping("/requests/{id}/hod-approve")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> hodApprove(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        revaluationService.approveByHod(id, remarks);
        return ResponseEntity.ok(Map.of("message", "Revaluation request approved by HOD."));
    }

    @PostMapping("/requests/{id}/faculty-update")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<?> facultyUpdate(@PathVariable Long id, @RequestBody FacultyRevaluationUpdateDto payload) {
        Objects.requireNonNull(payload, "payload must not be null");
        revaluationService.updateMarksByFaculty(id, payload.getNewInternal(), payload.getNewExternal());
        return ResponseEntity.ok(Map.of("message", "Marks updated by faculty for revaluation request."));
    }

    @PostMapping("/requests/{id}/hod-finalize")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> hodFinalize(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        revaluationService.finalizeByHod(id, remarks);
        return ResponseEntity.ok(Map.of("message", "Revaluation review finalized by HOD."));
    }

    @PostMapping("/requests/{id}/admin-close")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> adminClose(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        revaluationService.finalizeByAdmin(id, remarks);
        return ResponseEntity.ok(Map.of("message", "Revaluation workflow closed by Admin."));
    }
}

