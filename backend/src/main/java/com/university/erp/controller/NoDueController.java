package com.university.erp.controller;

import com.university.erp.model.User;
import com.university.erp.service.NoDueService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nodue")
public class NoDueController {

    private final NoDueService noDueService;

    public NoDueController(NoDueService noDueService) {
        this.noDueService = noDueService;
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getMyNoDueRequests() {
        return ResponseEntity.ok(noDueService.getStudentClearances(currentUser()));
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitNoDueRequest(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(noDueService.submitRequest(currentUser(), payload));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests() {
        return ResponseEntity.ok(noDueService.getScopedPendingRequests(currentUser()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.ok(noDueService.processRequest(id, payload, currentUser(), clientIp));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
