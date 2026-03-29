package com.university.erp.controller;

import com.university.erp.model.User;
import com.university.erp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<String> unlockUser(@PathVariable Long id,
                                             @AuthenticationPrincipal User admin,
                                             HttpServletRequest request) {
        userService.unlockUser(id, admin, getClientIp(request));
        return ResponseEntity.ok("User unlocked successfully");
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable Long id,
                                                 @AuthenticationPrincipal User admin,
                                                 HttpServletRequest request) {
        userService.deactivateUser(id, admin, getClientIp(request));
        return ResponseEntity.ok("User deactivated successfully");
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<String> resetPassword(@PathVariable Long id,
                                                @RequestBody Map<String, String> body,
                                                @AuthenticationPrincipal User admin,
                                                HttpServletRequest request) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("New password is required");
        }
        userService.resetPassword(id, newPassword, admin, getClientIp(request));
        return ResponseEntity.ok("Password reset successfully. User will be forced to change it on next login.");
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
