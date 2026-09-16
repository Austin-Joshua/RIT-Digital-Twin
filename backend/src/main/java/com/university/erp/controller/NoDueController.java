package com.university.erp.controller;

import com.university.erp.model.NoDueRequest;
import com.university.erp.model.Student;
import com.university.erp.model.User;
import com.university.erp.repository.NoDueRequestRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.util.ErpException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/nodue")
@RequiredArgsConstructor
public class NoDueController {

    private final NoDueRequestRepository noDueRequestRepository;
    private final StudentRepository studentRepository;

    private static final List<String> DEFAULT_CLEARANCES = List.of(
            "Library & Resource Center",
            "Department Computer Laboratories",
            "Hostel & Residential Office",
            "Finance & Academic Accounts",
            "Placement & Training Cell"
    );

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getMyNoDueRequests() {
        User user = currentUser();
        Student student = studentRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));

        List<NoDueRequest> existing = noDueRequestRepository.findByStudent_Id(student.getId());
        Map<String, NoDueRequest> map = new HashMap<>();
        for (NoDueRequest r : existing) {
            map.put(r.getClearanceType(), r);
        }

        List<Map<String, Object>> response = new ArrayList<>();
        int idCounter = 1;
        for (String clearance : DEFAULT_CLEARANCES) {
            NoDueRequest req = map.get(clearance);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", req != null ? req.getId() : idCounter++);
            item.put("name", clearance);
            item.put("code", "ND-" + clearance.substring(0, Math.min(clearance.length(), 4)).toUpperCase().trim());
            item.put("faculty", "Designated Officer");
            item.put("status", req != null ? req.getStatus() : "Not Requested");
            item.put("remarks", req != null && req.getRemarks() != null ? req.getRemarks() : "");
            response.add(item);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public ResponseEntity<Map<String, Object>> submitNoDueRequest(@RequestBody Map<String, String> payload) {
        User user = currentUser();
        Student student = studentRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));

        String clearanceType = payload.get("clearanceType");
        if (clearanceType == null || clearanceType.isBlank()) {
            throw new ErpException.InvalidOperationException("Clearance type is required");
        }

        NoDueRequest request = noDueRequestRepository.findByStudent_IdAndClearanceTypeIgnoreCase(student.getId(), clearanceType)
                .orElseGet(() -> NoDueRequest.builder()
                        .student(student)
                        .clearanceType(clearanceType)
                        .build());

        request.setStatus("Pending");
        request.setRequestedAt(LocalDateTime.now());
        noDueRequestRepository.save(request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "No Due request submitted for " + clearanceType,
                "status", "Pending"
        ));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests() {
        List<NoDueRequest> requests = noDueRequestRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        for (NoDueRequest r : requests) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r.getId());
            map.put("studentName", r.getStudent().getStudentName());
            map.put("reg", r.getStudent().getRegisterNo());
            map.put("dept", r.getStudent().getDepartment() != null ? r.getStudent().getDepartment().getDeptName() : "CSE");
            map.put("clearanceType", r.getClearanceType());
            map.put("status", r.getStatus());
            map.put("remarks", r.getRemarks());
            map.put("requestedAt", r.getRequestedAt());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        NoDueRequest request = noDueRequestRepository.findById(id)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Request not found"));

        String status = payload.getOrDefault("status", "APPROVED");
        String remarks = payload.getOrDefault("remarks", "Clearance granted.");

        request.setStatus(status);
        request.setRemarks(remarks);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedBy(currentUser());
        noDueRequestRepository.save(request);

        return ResponseEntity.ok(Map.of("success", true, "status", status));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
