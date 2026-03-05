package com.university.erp.controller;

import com.university.erp.entity.FacultyLeaveRequest;
import com.university.erp.repository.FacultyLeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty/leaves")
public class FacultyLeaveRequestController {

    @Autowired
    private FacultyLeaveRequestRepository repository;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HOD')")
    public List<FacultyLeaveRequest> getAllLeaves() {
        return repository.findAll();
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('FACULTY','HOD','ADMIN','SUPER_ADMIN')")
    public FacultyLeaveRequest createLeaveRequest(
            @org.springframework.lang.NonNull @RequestBody FacultyLeaveRequest request) {
        java.util.Objects.requireNonNull(request, "request body must not be null");
        return repository.save(request);
    }

    @PutMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('HOD','ADMIN','SUPER_ADMIN')")
    public FacultyLeaveRequest updateStatus(@org.springframework.lang.NonNull @PathVariable Long id,
            @org.springframework.lang.NonNull @RequestBody java.util.Map<String, String> body) {
        java.util.Objects.requireNonNull(id, "id must not be null");
        java.util.Objects.requireNonNull(body, "request body must not be null");
        FacultyLeaveRequest request = repository.findById(id).orElseThrow();
        request.setStatus(body.get("status"));
        return repository.save(request);
    }
}
