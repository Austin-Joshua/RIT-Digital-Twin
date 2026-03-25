package com.university.erp.service;

import com.university.erp.dto.AuthRequest;
import com.university.erp.dto.AuthResponse;
import com.university.erp.dto.RegisterRequest;
import com.university.erp.entity.Role;
import com.university.erp.entity.User;
import com.university.erp.entity.Student;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.defense.RiskScoringService;
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
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final BruteForceProtectionService bruteForceProtectionService;
    private final RiskScoringService riskScoringService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
            RoleRepository roleRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils, RefreshTokenService refreshTokenService,
            BruteForceProtectionService bruteForceProtectionService, RiskScoringService riskScoringService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.bruteForceProtectionService = bruteForceProtectionService;
        this.riskScoringService = riskScoringService;
    }

    @Transactional
    public AuthResponse login(AuthRequest request, String clientIp) {
        log.info("Attempting login for user: {}", request.getUsername());
        if (bruteForceProtectionService.isBlocked(request.getUsername())) {
            log.warn("Account is blocked due to too many failed attempts: {}", request.getUsername());
            throw new RuntimeException("Account is temporarily blocked. Please try again later.");
        }
        if (clientIp != null && bruteForceProtectionService.isBlockedByIp(clientIp)) {
            log.warn("Client IP is blocked due to too many failed attempts: {}", clientIp);
            throw new RuntimeException("Too many attempts. Please try again later.");
        }

        String username = request.getUsername().trim();
        String password = request.getPassword().trim();

        // Auto-generation logic for Student register number (e.g. 2117240020044)
        boolean isRegisterNo = username.matches("^\\d{12,14}$");
        Optional<User> existingUser = userRepository.findByUsername(username)
                .or(() -> userRepository.findByLinkedStudent_RegisterNo(username));

        if (existingUser.isEmpty() && isRegisterNo) {
            log.info("Register number {} not found. Attempting auto-registration.", username);
            Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                    .orElseThrow(() -> new RuntimeException("Default student role not configured."));

            User newUser = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .email(username + "@ritchennai.edu.in")
                    .firstName("Student")
                    .lastName(username)
                    .role(studentRole)
                    .accountStatus("active")
                    .forcePasswordChange(false)
                    .build();

            newUser = userRepository.save(newUser);
            log.info("Auto-registered new user record for: {}", username);

            Student newStudent = Student.builder()
                    .user(newUser)
                    .registerNo(username)
                    .studentIdNumber("S-" + username)
                    .studentName("Student " + username)
                    .status("active")
                    .build();

            studentRepository.save(newStudent);
            log.info("Auto-registered new student record for: {}", username);

            // Link bidirectionally and save User again to persist the linkedStudent link
            newUser.setLinkedStudent(newStudent);
            userRepository.save(newUser);
        }

        try {
            log.info("Authenticating credentials for username: {}", username);
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));

            if (authentication == null) {
                log.error("Authentication object is null for user: {}", username);
                throw new RuntimeException("Authentication failed: Internal error");
            }

            User user = (User) authentication.getPrincipal();
            if (user == null) {
                log.error("User principal is null for authenticated user: {}", username);
                throw new RuntimeException("Authentication failed: Principal not found");
            }

            log.info("Authentication successful. Building session for user ID: {}", user.getUserId());
            if ("inactive".equalsIgnoreCase(user.getAccountStatus())) {
                throw new RuntimeException("Account is inactive. Please contact admin.");
            }
            bruteForceProtectionService.loginSucceeded(username);
            bruteForceProtectionService.loginSucceededByIp(clientIp);
            user.setLastLogin(java.time.LocalDateTime.now());
            userRepository.save(user);

            String jwt = jwtUtils.generateToken(user);
            log.info("JWT generated successfully");

            com.university.erp.entity.RefreshToken refreshToken = refreshTokenService
                    .createRefreshToken(user.getUserId());
            log.info("Refresh token created successfully");

            String roleName = user.getRole() != null && user.getRole().getRoleName() != null
                    ? user.getRole().getRoleName().name()
                    : "STUDENT";

            log.info("Building response for user: {} with role: {}", user.getUsername(), roleName);
            return AuthResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getUserId())
                    .username(user.getUsername())
                    .role(roleName)
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .forcePasswordChange(user.isForcePasswordChange())
                    .studentId(user.getLinkedStudent() != null ? user.getLinkedStudent().getId() : null)
                    .registerNo(user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : null)
                    .build();
        } catch (Exception e) {
            log.error("CRITICAL: Login process failed for user {}: {}", username, e.getMessage(), e);
            bruteForceProtectionService.loginFailed(username);
            if (clientIp != null) {
                bruteForceProtectionService.loginFailedByIp(clientIp);
                riskScoringService.recordFailedAuth(clientIp);
            }
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
                // Modified: Auto-registration for students with @ritchennai.edu.in
                if (!email.toLowerCase().matches("^[\\w.!#$%&'*+/=?^_`{|}~-]+@[\\w.-]*ritchennai\\.edu\\.in$")) {
                    throw new RuntimeException(
                            "Google account must use an institutional email (@ritchennai.edu.in).");
                }

                log.info("User {} not found, performing auto-registration for student.", email);
                Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                        .orElseThrow(() -> new RuntimeException("Default student role not configured."));

                // Try to extract register number from email prefix if numeric
                String prefix = email.split("@")[0];
                String registerNo = prefix.matches("^\\d+$") ? prefix : null;

                user = User.builder()
                        .username(email)
                        .email(email)
                        .googleId(googleId)
                        .firstName(payload.get("given_name") != null ? (String) payload.get("given_name") : "Student")
                        .lastName(payload.get("family_name") != null ? (String) payload.get("family_name") : "")
                        .password(passwordEncoder.encode("GOOGLE_OAUTH_USER_" + googleId)) // Placeholder password
                        .role(studentRole)
                        .accountStatus("active")
                        .forcePasswordChange(false)
                        .build();

                user = userRepository.save(user);
                log.info("Created new user account for: {}", email);

                Student newStudent = Student.builder()
                        .user(user)
                        .registerNo(registerNo)
                        .studentIdNumber("G-" + (registerNo != null ? registerNo : googleId.substring(0, 10)))
                        .studentName(user.getFirstName() + " " + user.getLastName())
                        .email(email)
                        .status("active")
                        .build();

                studentRepository.save(newStudent);
                log.info("Auto-registered new student record for: {}", email);

                // Link bidirectionally and save User again to persist the linkedStudent link
                user.setLinkedStudent(newStudent);
                userRepository.save(user);
            }

            String jwt = jwtUtils.generateToken(user);
            com.university.erp.entity.RefreshToken refreshToken = refreshTokenService
                    .createRefreshToken(user.getUserId());
            log.info("Google login successful for user: {}", user.getUsername());

            return AuthResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getUserId())
                    .username(user.getUsername())
                    .role(user.getRole().getRoleName().name())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .forcePasswordChange(user.isForcePasswordChange())
                    .studentId(user.getLinkedStudent() != null ? user.getLinkedStudent().getId() : null)
                    .registerNo(user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : null)
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
                case "RIT-ADMIN":
                    roleEnumName = "ADMIN";
                    break;
                case "RIT-FACULTY":
                    roleEnumName = "FACULTY";
                    break;
                case "RIT-M":
                    roleEnumName = "ADMIN";
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
                .accountStatus("active")
                .build();

        userRepository.save(user);
        return "User registered successfully!";
    }

    @Transactional
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setForcePasswordChange(false);
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
                            .id(user.getUserId())
                            .username(user.getUsername())
                            .role(user.getRole().getRoleName().name())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .forcePasswordChange(user.isForcePasswordChange())
                            .studentId(user.getLinkedStudent() != null ? user.getLinkedStudent().getId() : null)
                            .registerNo(user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : null)
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
}
