package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.service.AcademicService;
import com.university.erp.service.StudentProfileService;
import com.university.erp.service.StudentAcademicOnboardingService;
import com.university.erp.util.ErpException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({ "/api/academic", "/api/academics" })
public class AcademicController {

    private final AcademicService academicService;
    private final StudentProfileService studentProfileService;
    private final StudentAcademicOnboardingService onboardingService;
    private final StudentLeaveRequestRepository leaveRequestRepository;
    private final ParentRepository parentRepository;
    private StudentRepository studentRepository;
    private AuditLogRepository auditLogRepository;

    public AcademicController(AcademicService academicService, StudentProfileService studentProfileService,
            StudentAcademicOnboardingService onboardingService, 
            StudentLeaveRequestRepository leaveRequestRepository,
            ParentRepository parentRepository) {
        this.academicService = academicService;
        this.studentProfileService = studentProfileService;
        this.onboardingService = onboardingService;
        this.leaveRequestRepository = leaveRequestRepository;
        this.parentRepository = parentRepository;
    }

    @Autowired
    public void setOptionalRepositories(
            StudentRepository studentRepository,
            AuditLogRepository auditLogRepository) {
        this.studentRepository = studentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping("/leave/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentLeaveRequest> applyLeave(@RequestBody StudentLeaveRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();

        String type = request.getType();
        if (type != null && !type.isBlank()) {
            type = type.trim().toUpperCase(Locale.ROOT);
            if (!"LEAVE".equals(type) && !"OD".equals(type)) {
                throw new ErpException.InvalidOperationException("Invalid request type: " + type + ". Allowed types: LEAVE, OD.");
            }
            request.setType(type);
        } else {
            request.setType("LEAVE");
        }

        request.setStudentId(currentUser.getUsername());
        request.setStudentName(currentUser.getFirstName() + " " + currentUser.getLastName());
        request.setStatus("PENDING");
        request.setApprovedBy(null);
        request.setApprovedAt(null);
        request.setRejectedBy(null);
        request.setRejectedAt(null);
        request.setRemarks(null);

        return ResponseEntity.ok(leaveRequestRepository.save(request));
    }

    @GetMapping("/leave/my-leaves")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentLeaveRequest>> getMyLeaves() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        return ResponseEntity.ok(leaveRequestRepository.findByStudentId(currentUser.getUsername()));
    }

    @GetMapping("/leave/pending")
    @PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN')")
    public ResponseEntity<List<StudentLeaveRequest>> getPendingStudentLeaves() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        Role.UserRole role = currentUser.getRole() != null ? currentUser.getRole().getRoleName() : null;

        List<StudentLeaveRequest> allPending = leaveRequestRepository.findByStatusOrderByStartDateDesc("PENDING");
        if (role == Role.UserRole.ADMIN) {
            return ResponseEntity.ok(allPending);
        }

        Long deptId = getDepartmentId(currentUser);
        if (deptId == null || studentRepository == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<StudentLeaveRequest> scoped = allPending.stream().filter(req -> {
            Optional<Student> studentOpt = studentRepository.findByRegisterNo(req.getStudentId())
                    .or(() -> studentRepository.findByStudentIdNumber(req.getStudentId()));
            if (studentOpt.isPresent() && studentOpt.get().getDepartment() != null) {
                return deptId.equals(studentOpt.get().getDepartment().getId());
            }
            return false;
        }).toList();

        return ResponseEntity.ok(scoped);
    }

    @PutMapping("/leave/{id}/status")
    @PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN')")
    public ResponseEntity<StudentLeaveRequest> updateStudentLeaveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        StudentLeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Leave request not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        Role.UserRole role = currentUser.getRole() != null ? currentUser.getRole().getRoleName() : null;

        // Resource & Department authorization scoping (Fail Closed)
        if (role != Role.UserRole.ADMIN) {
            Long deptId = getDepartmentId(currentUser);
            if (deptId == null) {
                throw new AccessDeniedException("Department authorization could not be established for user.");
            }
            if (studentRepository != null) {
                Optional<Student> studentOpt = studentRepository.findByRegisterNo(req.getStudentId())
                        .or(() -> studentRepository.findByStudentIdNumber(req.getStudentId()));
                if (studentOpt.isPresent() && studentOpt.get().getDepartment() != null) {
                    if (!deptId.equals(studentOpt.get().getDepartment().getId())) {
                        throw new AccessDeniedException("HOD/Faculty can only process leave/OD requests for students within their department.");
                    }
                } else {
                    throw new AccessDeniedException("Student department authorization could not be verified.");
                }
            }
        }

        String newStatus = body.getOrDefault("status", "APPROVED").toUpperCase(Locale.ROOT);
        if (!"APPROVED".equals(newStatus) && !"REJECTED".equals(newStatus)) {
            throw new ErpException.InvalidOperationException("Invalid leave status. Only APPROVED or REJECTED are permitted.");
        }
        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new ErpException.InvalidOperationException("Cannot update status of a request that is already " + req.getStatus());
        }

        String remarks = body.getOrDefault("remarks", "");

        req.setStatus(newStatus);
        req.setRemarks(remarks);
        if ("APPROVED".equals(newStatus)) {
            req.setApprovedBy(currentUser.getUsername());
            req.setApprovedAt(LocalDateTime.now());
            req.setRejectedBy(null);
            req.setRejectedAt(null);
        } else {
            req.setRejectedBy(currentUser.getUsername());
            req.setRejectedAt(LocalDateTime.now());
            req.setApprovedBy(null);
            req.setApprovedAt(null);
        }

        StudentLeaveRequest saved = leaveRequestRepository.save(req);

        if (auditLogRepository != null) {
            auditLogRepository.save(AuditLog.builder()
                    .actor(currentUser)
                    .action("LEAVE_OD_PROCESS")
                    .actionTime(LocalDateTime.now())
                    .details(String.format("Processed Request ID: %d (%s) for Student: %s. New Status: %s. Remarks: %s",
                            id, req.getType(), req.getStudentId(), newStatus, remarks))
                    .build());
        }

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/marks/{studentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<String> enterMarks(@PathVariable @org.springframework.lang.NonNull Long studentId,
            @RequestBody @org.springframework.lang.NonNull Marks marks) {
        Objects.requireNonNull(studentId, "studentId must not be null");
        Objects.requireNonNull(marks, "marks payload must not be null");
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

        Student targetStudent = studentProfileService.getByStudentId(studentId);

        // Student can only access their own marks
        if (role == Role.UserRole.STUDENT) {
            Student self = studentProfileService.getByUserId(currentUser.getId());
            if (!self.getId().equals(studentId)) {
                throw new AccessDeniedException("Students can only view their own marks.");
            }
        }

        // Parent must only access their linked ward
        if (role == Role.UserRole.PARENT) {
            Parent parent = parentRepository.findByUser_Id(currentUser.getId())
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
    public ResponseEntity<List<Map<String, Object>>> getStudentCgpa() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(onboardingService.getSemGpa(currentUser.getId()));
    }

    private Long getDepartmentId(User user) {
        if (user.getDepartment() != null) {
            return user.getDepartment().getId();
        }
        return null;
    }
}
