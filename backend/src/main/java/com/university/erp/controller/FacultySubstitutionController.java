package com.university.erp.controller;

import com.university.erp.dto.FacultySubstitutionDto;
import com.university.erp.model.User;
import com.university.erp.service.FacultySubstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty/substitutions")
@RequiredArgsConstructor
public class FacultySubstitutionController {

    private final FacultySubstitutionService substitutionService;

    @GetMapping("/eligible")
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
    public ResponseEntity<List<FacultySubstitutionDto.Candidate>> getEligibleSubstitutes(
            @RequestParam Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(substitutionService.findEligibleSubstitutes(slotId, date, currentUser));
    }

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
    public ResponseEntity<FacultySubstitutionDto.Response> requestSubstitution(
            @RequestBody FacultySubstitutionDto.Request request,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(substitutionService.requestSubstitution(request, currentUser));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
    public ResponseEntity<FacultySubstitutionDto.Response> approveSubstitution(
            @PathVariable Long id,
            @RequestBody(required = false) FacultySubstitutionDto.Action action,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        String remarks = action != null ? action.getRemarks() : "Approved";
        return ResponseEntity.ok(substitutionService.approveSubstitution(id, remarks, currentUser));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
    public ResponseEntity<FacultySubstitutionDto.Response> rejectSubstitution(
            @PathVariable Long id,
            @RequestBody(required = false) FacultySubstitutionDto.Action action,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        String remarks = action != null ? action.getRemarks() : "Rejected";
        return ResponseEntity.ok(substitutionService.rejectSubstitution(id, remarks, currentUser));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
    public ResponseEntity<FacultySubstitutionDto.Response> cancelSubstitution(
            @PathVariable Long id,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(substitutionService.cancelSubstitution(id, currentUser));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
    public ResponseEntity<List<FacultySubstitutionDto.Response>> getMySubstitutions(
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(substitutionService.getMySubstitutions(currentUser));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
    public ResponseEntity<List<FacultySubstitutionDto.Response>> getPendingSubstitutions(
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(substitutionService.getPendingSubstitutions(currentUser));
    }
}
