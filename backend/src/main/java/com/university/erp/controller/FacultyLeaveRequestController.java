package com.university.erp.controller;

import com.university.erp.entity.FacultyLeaveRequest;
import com.university.erp.repository.FacultyLeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty/leaves")
@CrossOrigin(origins = "*")
public class FacultyLeaveRequestController {

    @Autowired
    private FacultyLeaveRequestRepository repository;

    @GetMapping
    public List<FacultyLeaveRequest> getAllLeaves() {
        return repository.findAll();
    }

    @PostMapping
    public FacultyLeaveRequest createLeaveRequest(@RequestBody FacultyLeaveRequest request) {
        return repository.save(request);
    }

    @PutMapping("/{id}/status")
    public FacultyLeaveRequest updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        FacultyLeaveRequest request = repository.findById(id).orElseThrow();
        request.setStatus(body.get("status"));
        return repository.save(request);
    }
}
