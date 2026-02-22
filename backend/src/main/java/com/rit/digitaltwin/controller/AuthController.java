package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.AuthResponse;
import com.rit.digitaltwin.dto.LoginRequest;
import com.rit.digitaltwin.dto.RegisterRequest;
import com.rit.digitaltwin.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

        private final AuthService authService;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                try {
                        AuthResponse response = authService.authenticateUser(loginRequest);
                        return ResponseEntity.ok(response);
                } catch (Exception e) {
                        return ResponseEntity.badRequest().body("Invalid Institutional ID or Password");
                }
        }

        @PostMapping("/register")
        public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
                try {
                        authService.registerUser(registerRequest);
                        return ResponseEntity.ok("User registered successfully!");
                } catch (Exception e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}
