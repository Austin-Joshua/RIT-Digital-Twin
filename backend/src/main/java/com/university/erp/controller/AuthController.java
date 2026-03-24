package com.university.erp.controller;

import com.university.erp.dto.AuthRequest;
import com.university.erp.dto.AuthResponse;
import com.university.erp.dto.GoogleAuthRequest;
import com.university.erp.dto.ChangePasswordRequest;
import com.university.erp.dto.RegisterRequest;
import com.university.erp.entity.User;
import com.university.erp.service.AuthService;
import com.university.erp.service.BruteForceProtectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final BruteForceProtectionService bruteForceProtectionService;

    public AuthController(AuthService authService, BruteForceProtectionService bruteForceProtectionService) {
        this.authService = authService;
        this.bruteForceProtectionService = bruteForceProtectionService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest,
                                                         HttpServletRequest request) {
        String clientIp = getClientIp(request);
        return ResponseEntity.ok(authService.login(authRequest, clientIp));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateGoogle(@Valid @RequestBody GoogleAuthRequest googleRequest) {
        return ResponseEntity.ok(authService.googleLogin(googleRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody com.university.erp.dto.TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        java.util.Objects.requireNonNull(authentication, "authentication must not be null");
        User user = (User) authentication.getPrincipal();
        java.util.Objects.requireNonNull(user, "user principal must not be null");
        java.util.Objects.requireNonNull(user.getUsername(), "username must not be null");
        java.util.Objects.requireNonNull(user.getRole(), "user role must not be null");
        return ResponseEntity.ok(AuthResponse.builder()
                .username(user.getUsername())
                .role(user.getRole().getRoleName().name())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .forcePasswordChange(user.isForcePasswordChange())
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        java.util.Objects.requireNonNull(authentication, "authentication must not be null");
        User user = (User) authentication.getPrincipal();
        java.util.Objects.requireNonNull(user, "user principal must not be null");
        java.util.Objects.requireNonNull(request.getNewPassword(), "new password must not be null");
        authService.changePassword(user, request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully!");
    }

    /** Unblock a username/email that was locked due to too many failed login attempts. Admin only. */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/unblock")
    public ResponseEntity<String> unblockUser(@RequestBody Map<String, String> body) {
        String username = body != null ? body.get("username") : null;
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body("Missing 'username' in request body.");
        }
        bruteForceProtectionService.unblock(username.trim());
        return ResponseEntity.ok("Account unblocked: " + username);
    }

    /** Unblock an IP that was locked due to too many failed login attempts. Admin only. */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/unblock-ip")
    public ResponseEntity<String> unblockIp(@RequestBody Map<String, String> body) {
        String ip = body != null ? body.get("ip") : null;
        if (ip == null || ip.isBlank()) {
            return ResponseEntity.badRequest().body("Missing 'ip' in request body.");
        }
        bruteForceProtectionService.unblockIp(ip.trim());
        return ResponseEntity.ok("IP unblocked.");
    }

    private static String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote != null ? remote : "0.0.0.0";
    }
}
