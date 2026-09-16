package com.university.erp.controller;

import com.university.erp.model.Marks;
import com.university.erp.model.User;
import com.university.erp.model.Role;
import com.university.erp.service.AcademicService;
import com.university.erp.service.StudentProfileService;
import com.university.erp.service.StudentAcademicOnboardingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping({ "/api/academic", "/api/academics" })
public class AcademicController {

    private final AcademicService academicService;
    private final StudentProfileService studentProfileService;
    private final StudentAcademicOnboardingService onboardingService;
    private final com.university.erp.repository.StudentLeaveRequestRepository leaveRequestRepository;
    private final com.university.erp.repository.ParentRepository parentRepository;

    public AcademicController(AcademicService academicService, StudentProfileService studentProfileService,
            StudentAcademicOnboardingService onboardingService, 
            com.university.erp.repository.StudentLeaveRequestRepository leaveRequestRepository,
            com.university.erp.repository.ParentRepository parentRepository) {
        this.academicService = academicService;
        this.studentProfileService = studentProfileService;
        this.onboardingService = onboardingService;
        this.leaveRequestRepository = leaveRequestRepository;
        this.parentRepository = parentRepository;
    }

    @PostMapping("/leave/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<com.university.erp.model.StudentLeaveRequest> applyLeave(@RequestBody com.university.erp.model.StudentLeaveRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        request.setStudentId(currentUser.getUsername());
        request.setStudentName(currentUser.getFirstName() + " " + currentUser.getLastName());
        request.setStatus("PENDING");
        return ResponseEntity.ok(leaveRequestRepository.save(request));
    }

    @GetMapping("/leave/my-leaves")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<com.university.erp.model.StudentLeaveRequest>> getMyLeaves() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        return ResponseEntity.ok(leaveRequestRepository.findByStudentId(currentUser.getUsername()));
    }

    @GetMapping("/leave/pending")
    @PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN')")
    public ResponseEntity<List<com.university.erp.model.StudentLeaveRequest>> getPendingStudentLeaves() {
        return ResponseEntity.ok(leaveRequestRepository.findByStatusOrderByStartDateDesc("PENDING"));
    }

    @PutMapping("/leave/{id}/status")
    @PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN')")
    public ResponseEntity<com.university.erp.model.StudentLeaveRequest> updateStudentLeaveStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        com.university.erp.model.StudentLeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException("Leave request not found"));

        String newStatus = body.getOrDefault("status", "APPROVED").toUpperCase();
        if (!"APPROVED".equals(newStatus) && !"REJECTED".equals(newStatus)) {
            throw new com.university.erp.util.ErpException.InvalidOperationException("Invalid leave status. Only APPROVED or REJECTED are permitted.");
        }
        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new com.university.erp.util.ErpException.InvalidOperationException("Cannot update status of a request that is already " + req.getStatus());
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        String remarks = body.getOrDefault("remarks", "");

        req.setStatus(newStatus);
        req.setRemarks(remarks);
        if ("APPROVED".equals(newStatus)) {
            req.setApprovedBy(currentUser.getUsername());
            req.setApprovedAt(java.time.LocalDateTime.now());
            req.setRejectedBy(null);
            req.setRejectedAt(null);
        } else {
            req.setRejectedBy(currentUser.getUsername());
            req.setRejectedAt(java.time.LocalDateTime.now());
            req.setApprovedBy(null);
            req.setApprovedAt(null);
        }
        return ResponseEntity.ok(leaveRequestRepository.save(req));
    }

    @PostMapping("/marks/{studentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<String> enterMarks(@PathVariable @org.springframework.lang.NonNull Long studentId,
            @RequestBody @org.springframework.lang.NonNull Marks marks) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        java.util.Objects.requireNonNull(marks, "marks payload must not be null");
        academicService.enterMarks(studentId, marks);
        return ResponseEntity.ok("Marks entered successfully");
    }

    @GetMapping("/marks/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN','HOD','PARENT')")
    public ResponseEntity<List<Marks>> getStudentMarks(
            @PathVariable @org.springframework.lang.NonNull Long studentId,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size) {
        Objects.requireNonNull(studentId, "studentId must not be null");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Objects.requireNonNull(authentication, "authentication must not be null");
        User currentUser = (User) authentication.getPrincipal();
        Objects.requireNonNull(currentUser, "user principal must not be null");
        Role.UserRole role = currentUser.getRole().getRoleName();

        com.university.erp.model.Student targetStudent = studentProfileService.getByStudentId(studentId);

        // Student can only access their own marks
        if (role == Role.UserRole.STUDENT) {
            com.university.erp.model.Student self = studentProfileService.getByUserId(currentUser.getId());
            if (!self.getId().equals(studentId)) {
                throw new AccessDeniedException("Students can only view their own marks.");
            }
        }

        // Parent must only access their linked ward
        if (role == Role.UserRole.PARENT) {
            com.university.erp.model.Parent parent = parentRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new AccessDeniedException("Parent record not found for authenticated user."));
            if (parent.getStudent() == null || !parent.getStudent().getId().equals(studentId)) {
                throw new AccessDeniedException("Parents can only access marks for their linked ward.");
            }
        }

        // Faculty and HOD are limited to their department where available
        if (role == Role.UserRole.FACULTY || role == Role.UserRole.HOD) {
            if (currentUser.getDepartment() != null && targetStudent.getDepartment() != null
                    && !currentUser.getDepartment().getId().equals(targetStudent.getDepartment().getId())) {
                throw new AccessDeniedException("Faculty/HOD can only view students within their department.");
            }
        }

        // ADMIN is allowed by role guard alone

        List<Marks> marks;
        if (page != null && size != null) {
            marks = academicService.getStudentMarksPaged(studentId, page, size);
        } else {
            marks = academicService.getStudentMarks(studentId);
        }

        return ResponseEntity.ok(marks);
    }

    @GetMapping("/student/cgpa")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<java.util.Map<String, Object>>> getStudentCgpa() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(onboardingService.getSemGpa(currentUser.getId()));
    }
}
