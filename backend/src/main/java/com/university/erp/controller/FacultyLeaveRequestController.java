package com.university.erp.controller;

import com.university.erp.model.FacultyLeaveRequest;
import com.university.erp.model.FacultyProfile;
import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.FacultyLeaveRequestRepository;
import com.university.erp.repository.FacultyProfileRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.service.NotificationService;
import com.university.erp.util.ErpException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/faculty/leaves")
public class FacultyLeaveRequestController {

    @Autowired
    private FacultyLeaveRequestRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private NotificationService notificationService;

    private String resolveFacultyDepartment(FacultyLeaveRequest req) {
        if (req == null) return null;
        String identifier = req.getFacultyId();
        if (identifier == null || identifier.isBlank()) {
            identifier = req.getFacultyName();
        }
        if (identifier == null || identifier.isBlank()) {
            return null;
        }

        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(identifier);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getDepartment() != null && user.getDepartment().getDeptName() != null) {
                return user.getDepartment().getDeptName();
            }
            Optional<FacultyProfile> profileOpt = facultyProfileRepository.findByUser_Id(user.getId());
            if (profileOpt.isPresent() && profileOpt.get().getDepartment() != null) {
                return profileOpt.get().getDepartment();
            }
        }
        return null;
    }

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

        String hodDeptName = currentUser.getDepartment().getDeptName();
        return all.stream()
                .filter(r -> {
                    String dept = resolveFacultyDepartment(r);
                    return dept != null && hodDeptName.equalsIgnoreCase(dept);
                })
                .toList();
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN')")
    public FacultyLeaveRequest createLeaveRequest(
            @org.springframework.lang.NonNull @RequestBody FacultyLeaveRequest request) {
        java.util.Objects.requireNonNull(request, "request body must not be null");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();

        if (request.getFacultyId() == null || request.getFacultyId().isBlank()) {
            request.setFacultyId(currentUser.getUsername());
        }
        if (request.getFacultyName() == null || request.getFacultyName().isBlank()) {
            String name = (currentUser.getFirstName() != null ? currentUser.getFirstName() : "") +
                    (currentUser.getLastName() != null ? " " + currentUser.getLastName() : "");
            request.setFacultyName(name.isBlank() ? currentUser.getUsername() : name.trim());
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
            String reqDept = resolveFacultyDepartment(request);
            if (reqDept == null || !currentUser.getDepartment().getDeptName().equalsIgnoreCase(reqDept)) {
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
