package com.university.erp.controller;

import com.university.erp.dto.AuthRequest;
import com.university.erp.dto.AuthResponse;
import com.university.erp.dto.ChangePasswordRequest;
import com.university.erp.dto.RegisterRequest;
import com.university.erp.model.User;
import com.university.erp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok(authService.login(authRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
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
        return ResponseEntity.ok(java.util.Objects.requireNonNull("Password updated successfully!", "message must not be null"));
    }
}
