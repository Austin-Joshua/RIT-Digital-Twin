package com.university.erp.service;

import com.university.erp.dto.AuthRequest;
import com.university.erp.dto.AuthResponse;
import com.university.erp.dto.RegisterRequest;
import com.university.erp.entity.Role;
import com.university.erp.entity.User;
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
import com.university.erp.dto.GoogleAuthRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import java.util.Collections;
import java.util.Optional;

@Service
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final BruteForceProtectionService bruteForceProtectionService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
            RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils,
            RefreshTokenService refreshTokenService, BruteForceProtectionService bruteForceProtectionService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.bruteForceProtectionService = bruteForceProtectionService;
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        log.info("Attempting login for user: {}", request.getUsername());
        if (bruteForceProtectionService.isBlocked(request.getUsername())) {
            log.warn("Account is blocked due to too many failed attempts: {}", request.getUsername());
            throw new RuntimeException("Account is temporarily blocked. Please try again later.");
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            User user = (User) authentication.getPrincipal();
            bruteForceProtectionService.loginSucceeded(request.getUsername());
            String jwt = jwtUtils.generateToken(user);
            com.university.erp.entity.RefreshToken refreshToken = refreshTokenService
                    .createRefreshToken(user.getId());

            log.info("Login successful for user: {}", user.getUsername());
            return (AuthResponse) AuthResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getId())
                    .username(user.getUsername())
                    .role(user.getRole().getRoleName().name())
                    .build();
        } catch (Exception e) {
            bruteForceProtectionService.loginFailed(request.getUsername());
            log.error("Login failed for user: {}. Error: {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {
        log.info("Attempting Google login");
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    userRepository.save(user);
                    log.info("Linked Google account for user: {}", email);
                }
            } else {
                // If user doesn't exist, we could potentially auto-register them if they have
                // @ritchennai.edu.in
                if (!email.toLowerCase().matches("^[\\w.!#$%&'*+/=?^_`{|}~-]+@[\\w.-]+\\.ritchennai\\.edu\\.in$")) {
                    throw new RuntimeException(
                            "Google account must use a departmental email (e.g., @department.ritchennai.edu.in).");
                }

                log.info("User {} not found, auto-registration required or linking to existing student record.", email);
                throw new RuntimeException("Account not found. Please register first with your institutional email.");
            }

            String jwt = jwtUtils.generateToken(user);
            com.university.erp.entity.RefreshToken refreshToken = refreshTokenService
                    .createRefreshToken(user.getId());
            log.info("Google login successful for user: {}", user.getUsername());

            return AuthResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getId())
                    .username(user.getUsername())
                    .role(user.getRole().getRoleName().name())
                    .build();

        } catch (Exception e) {
            log.error("Google login failed: {}", e.getMessage());
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (request.getEmail() == null || !request.getEmail().toLowerCase()
                .matches("^[\\w.!#$%&'*+/=?^_`{|}~-]+@[\\w.-]+\\.ritchennai\\.edu\\.in$")) {
            throw new RuntimeException(
                    "Error: Registration is restricted to departmental @department.ritchennai.edu.in email addresses.");
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
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthResponse refreshToken(com.university.erp.dto.TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.university.erp.entity.RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateToken(user);
                    return AuthResponse.builder()
                            .token(token)
                            .refreshToken(requestRefreshToken)
                            .id(user.getId())
                            .username(user.getUsername())
                            .role(user.getRole().getRoleName().name())
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
}
