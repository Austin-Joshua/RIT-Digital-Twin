package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.AuthResponse;
import com.rit.digitaltwin.dto.LoginRequest;
import com.rit.digitaltwin.repository.UserRepository;
import com.rit.digitaltwin.security.JwtUtil;

import com.rit.digitaltwin.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        JwtUtil jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                System.out.println("Received login request for: " + loginRequest.getUsername() + ", password: "
                                + loginRequest.getPassword());

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateToken(authentication);

                System.out.println("Authentication successful. Principal: " + authentication.getPrincipal());

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                User user = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                System.out.println("User retrieved: " + user.getUsername());

                String roleName = "UNKNOWN";
                if (user.getRole() != null) {
                        System.out.println("Role found: " + user.getRole().getRoleName());
                        roleName = user.getRole().getRoleName();
                } else {
                        System.out.println("Role is NULL");
                }

                return ResponseEntity.ok(new AuthResponse(jwt,
                                user.getUserId(),
                                user.getUsername(),
                                user.getEmail(),
                                roleName));
        }
}
