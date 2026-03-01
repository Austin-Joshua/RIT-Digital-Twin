package com.university.erp.service;

import com.university.erp.dto.AuthRequest;
import com.university.erp.dto.AuthResponse;
import com.university.erp.dto.RegisterRequest;
import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
            RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse login(AuthRequest request) {
        log.info("Attempting login for user: {}", request.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            User user = java.util.Objects.requireNonNull((User) authentication.getPrincipal(), "authenticated user must not be null");
            String jwt = jwtUtils.generateToken(user);

            log.info("Login successful for user: {}", user.getUsername());
            return AuthResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .username(user.getUsername())
                    .role(user.getRole().getRoleName().name())
                    .build();
        } catch (Exception e) {
            log.error("Login failed for user: {}. Error: {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (request.getEmail() == null || !request.getEmail().toLowerCase().endsWith("@ritchennai.edu.in")) {
            throw new RuntimeException(
                    "Error: Registration is restricted to official @ritchennai.edu.in email addresses.");
        }

        String roleEnumName = "STUDENT";
        String inviteCode = request.getInviteCode();

        if (inviteCode != null && !inviteCode.isBlank()) {
            switch (inviteCode) {
                case "RIT-SUPER":
                    roleEnumName = "SUPER_ADMIN";
                    break;
                case "RIT-ADMIN":
                    roleEnumName = "ADMIN";
                    break;
                case "RIT-FACULTY":
                    roleEnumName = "FACULTY";
                    break;
                case "RIT-PARENT":
                    roleEnumName = "PARENT";
                    break;
            }
        }

        Role role = roleRepository.findByRoleName(Role.UserRole.valueOf(roleEnumName))
                .orElseThrow(() -> new RuntimeException("Error: Role not found in database."));

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .build();

        userRepository.save(user);
        return "User registered successfully!";
    }

    @Transactional
    public void changePassword(@org.springframework.lang.NonNull User user, @org.springframework.lang.NonNull String newPassword) {
        java.util.Objects.requireNonNull(user, "user must not be null");
        java.util.Objects.requireNonNull(newPassword, "newPassword must not be null");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
