package com.university.erp.controller;

import com.university.erp.model.FacultyLeaveRequest;
import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.FacultyLeaveRequestRepository;
import com.university.erp.service.NotificationService;
import com.university.erp.util.ErpException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/faculty/leaves")
public class FacultyLeaveRequestController {

    @Autowired
    private FacultyLeaveRequestRepository repository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public List<FacultyLeaveRequest> getAllLeaves() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        Role.UserRole role = currentUser.getRole() != null ? currentUser.getRole().getRoleName() : null;

        List<FacultyLeaveRequest> all = repository.findAll();
        if (role == Role.UserRole.ADMIN) {
            return all;
        }

        if (currentUser.getDepartment() == null || currentUser.getDepartment().getDeptName() == null) {
            throw new AccessDeniedException("Access Denied: HOD departmental context missing.");
        }

        String deptName = currentUser.getDepartment().getDeptName();
        return all.stream()
                .filter(r -> r.getDepartment() != null && deptName.equalsIgnoreCase(r.getDepartment()))
                .toList();
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN')")
    public FacultyLeaveRequest createLeaveRequest(
            @org.springframework.lang.NonNull @RequestBody FacultyLeaveRequest request) {
        java.util.Objects.requireNonNull(request, "request body must not be null");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        if (request.getFacultyName() == null || request.getFacultyName().isBlank()) {
            request.setFacultyName(currentUser.getUsername());
        }
        if (request.getDepartment() == null && currentUser.getDepartment() != null) {
            request.setDepartment(currentUser.getDepartment().getDeptName());
        }
        request.setStatus("PENDING");
        return repository.save(request);
    }

    @PutMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public FacultyLeaveRequest updateStatus(@org.springframework.lang.NonNull @PathVariable Long id,
            @org.springframework.lang.NonNull @RequestBody java.util.Map<String, String> body) {
        java.util.Objects.requireNonNull(id, "id must not be null");
        java.util.Objects.requireNonNull(body, "request body must not be null");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        Role.UserRole role = currentUser.getRole() != null ? currentUser.getRole().getRoleName() : null;

        FacultyLeaveRequest request = repository.findById(id)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Faculty leave request not found with ID: " + id));

        if (role != Role.UserRole.ADMIN) {
            if (currentUser.getDepartment() == null || currentUser.getDepartment().getDeptName() == null) {
                throw new AccessDeniedException("Access Denied: HOD departmental context missing.");
            }
            if (request.getDepartment() == null || !currentUser.getDepartment().getDeptName().equalsIgnoreCase(request.getDepartment())) {
                throw new AccessDeniedException("Access Denied: You can only approve/reject faculty leaves within your authorized department.");
            }
        }

        String targetStatus = body.getOrDefault("status", "APPROVED").toUpperCase(Locale.ROOT);
        if (!"APPROVED".equals(targetStatus) && !"REJECTED".equals(targetStatus)) {
            throw new ErpException.BadRequestException("Invalid leave status transition. Allowed: APPROVED, REJECTED.");
        }
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new ErpException.InvalidOperationException("Cannot update status of a faculty leave that is already " + request.getStatus());
        }

        request.setStatus(targetStatus);
        FacultyLeaveRequest saved = repository.save(request);
        notificationService.sendBroadcast("Faculty Leave Request Update",
                "Faculty leave request #" + id + " has been " + targetStatus + ". Check your dashboard.");
        return saved;
    }
}
