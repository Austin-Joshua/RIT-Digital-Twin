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
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(AuthResponse.builder()
                .username(user.getUsername())
                .role(user.getRole().getRoleName().name())
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        User user = (User) authentication.getPrincipal();
        authService.changePassword(user, request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully!");
    }
}
