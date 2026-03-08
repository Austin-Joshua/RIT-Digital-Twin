package com.university.erp.controller;

import com.university.erp.entity.FacultyLeaveRequest;
import com.university.erp.repository.FacultyLeaveRequestRepository;
import com.university.erp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return repository.findAll();
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN')")
    public FacultyLeaveRequest createLeaveRequest(
            @org.springframework.lang.NonNull @RequestBody FacultyLeaveRequest request) {
        java.util.Objects.requireNonNull(request, "request body must not be null");
        return repository.save(request);
    }

    @PutMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public FacultyLeaveRequest updateStatus(@org.springframework.lang.NonNull @PathVariable Long id,
            @org.springframework.lang.NonNull @RequestBody java.util.Map<String, String> body) {
        java.util.Objects.requireNonNull(id, "id must not be null");
        java.util.Objects.requireNonNull(body, "request body must not be null");
        FacultyLeaveRequest request = repository.findById(id).orElseThrow();
        String status = body.get("status");
        request.setStatus(status);
        FacultyLeaveRequest saved = repository.save(request);
        notificationService.sendBroadcast("Leave Request Update",
                "Leave request #" + id + " has been " + (status != null ? status : "updated") + ". Check your dashboard.");
        return saved;
    }
}
