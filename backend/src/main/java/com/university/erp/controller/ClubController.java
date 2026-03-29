package com.university.erp.controller;

import com.university.erp.model.Role;
import com.university.erp.model.Student;
import com.university.erp.model.User;
import com.university.erp.repository.StudentRepository;
import com.university.erp.service.ClubService;
import com.university.erp.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;
    private final StudentProfileService studentProfileService;
    private final StudentRepository studentRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubsWithMemberCount());
    }

    @GetMapping("/student/me/involvement")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getMyInvolvement() {
        User current = currentUser();
        return ResponseEntity.ok(clubService.getStudentInvolvementForLoggedInStudent(current.getId()));
    }

    @GetMapping("/student/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyStudentProfileRef() {
        User current = currentUser();
        Student student = studentProfileService.getByUserId(current.getId());
        return ResponseEntity.ok(Map.of(
                "studentId", student.getId(),
                "studentIdNumber", student.getStudentIdNumber()
        ));
    }

    @GetMapping("/student/{studentId}/involvement")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','HOD','PARENT','STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentInvolvement(@PathVariable Long studentId) {
        User current = currentUser();
        enforceStudentInvolvementReadAccess(current, studentId);
        return ResponseEntity.ok(clubService.getStudentInvolvement(studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createClub(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(clubService.createClub(payload));
    }

    @PutMapping("/{clubId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateClub(@PathVariable Long clubId, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(clubService.updateClub(clubId, payload));
    }

    @PatchMapping("/{clubId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> setClubStatus(@PathVariable Long clubId, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(clubService.setClubStatus(clubId, String.valueOf(payload.getOrDefault("status", "inactive"))));
    }

    @PatchMapping("/{clubId}/coordinator")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> assignCoordinator(@PathVariable Long clubId, @RequestBody Map<String, Object> payload) {
        Long facultyUserId = payload.get("facultyUserId") == null ? null : Long.valueOf(String.valueOf(payload.get("facultyUserId")));
        return ResponseEntity.ok(clubService.assignCoordinator(clubId, facultyUserId));
    }

    @PostMapping("/memberships")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','HOD')")
    public ResponseEntity<Map<String, Object>> addMembership(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(clubService.addMembership(payload, currentUser()));
    }

    @PostMapping("/memberships/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> requestMembership(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(clubService.addMembership(payload, currentUser()));
    }

    @PutMapping("/memberships/{membershipId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','HOD')")
    public ResponseEntity<Map<String, Object>> updateMembership(@PathVariable Long membershipId, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(clubService.updateMembership(membershipId, payload, currentUser()));
    }

    @DeleteMapping("/memberships/{membershipId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','HOD')")
    public ResponseEntity<Void> deactivateMembership(@PathVariable Long membershipId) {
        clubService.deactivateMembership(membershipId, currentUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{clubId}/members")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','HOD')")
    public ResponseEntity<List<Map<String, Object>>> getClubMembers(@PathVariable Long clubId) {
        return ResponseEntity.ok(clubService.getClubMembers(clubId, currentUser()));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(clubService.getAnalytics(currentUser()));
    }

    @GetMapping("/faculty-options")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<List<Map<String, Object>>> getFacultyOptions() {
        return ResponseEntity.ok(clubService.getFacultyCoordinatorOptions(currentUser()));
    }

    @GetMapping("/{clubId}/export")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','HOD')")
    public ResponseEntity<String> exportMembers(@PathVariable Long clubId) {
        String csv = clubService.exportMembersCsv(clubId, currentUser());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=club-" + clubId + "-members.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new AccessDeniedException("Authenticated user required");
        }
        return user;
    }

    private void enforceStudentInvolvementReadAccess(User current, Long studentId) {
        Role.UserRole role = current.getRole().getRoleName();
        if (role == Role.UserRole.ADMIN) return;
        if (role == Role.UserRole.STUDENT) {
            Student self = studentProfileService.getByUserId(current.getId());
            if (!Objects.equals(self.getId(), studentId)) throw new AccessDeniedException("Students can only view their own clubs");
            return;
        }
        Student target = studentRepository.findById(studentId)
                .orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException("Student not found"));
        if ((role == Role.UserRole.FACULTY || role == Role.UserRole.HOD) && current.getDepartment() != null && target.getDepartment() != null
                && !Objects.equals(current.getDepartment().getId(), target.getDepartment().getId())) {
            throw new AccessDeniedException("Department scope violation");
        }
        // Parent is read-only and currently allowed to view student club involvement.
    }
}
