package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.AuthResponse;
import com.rit.digitaltwin.dto.LoginRequest;
import com.rit.digitaltwin.model.Role;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.repository.RoleRepository;
import com.rit.digitaltwin.repository.UserRepository;
import com.rit.digitaltwin.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        RoleRepository roleRepository;

        @Autowired
        PasswordEncoder passwordEncoder;

        @Autowired
        JwtUtil jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateToken(authentication);

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                User user = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String roleName = user.getRole() != null ? user.getRole().getRoleName() : "UNKNOWN";

                return ResponseEntity.ok(new AuthResponse(jwt,
                                user.getUserId(),
                                user.getUsername(),
                                user.getEmail(),
                                roleName));
        }

        @PostMapping("/register")
        public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
                String username = request.get("username");
                String email = request.get("email");
                String password = request.get("password");
                String firstName = request.get("firstName");
                String lastName = request.get("lastName");

                if (username == null || email == null || password == null) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Username, email, and password are required"));
                }

                if (userRepository.existsByUsername(username)) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Username is already taken"));
                }

                if (userRepository.existsByEmail(email)) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Email is already registered"));
                }

                Role defaultRole = roleRepository.findByRoleName("FACULTY")
                                .orElseGet(() -> roleRepository.findByRoleName("ADMIN")
                                                .orElseThrow(() -> new RuntimeException("No roles found")));

                User newUser = new User();
                newUser.setUsername(username);
                newUser.setEmail(email);
                newUser.setPassword(passwordEncoder.encode(password));
                newUser.setFirstName(firstName);
                newUser.setLastName(lastName);
                newUser.setRole(defaultRole);
                userRepository.save(newUser);

                // Auto-login after registration
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(username, password));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateToken(authentication);

                String roleName = newUser.getRole() != null ? newUser.getRole().getRoleName() : "UNKNOWN";

                return ResponseEntity.ok(new AuthResponse(jwt,
                                newUser.getUserId(),
                                newUser.getUsername(),
                                newUser.getEmail(),
                                roleName));
        }
}
