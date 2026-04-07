package com.university.erp.service;

import com.university.erp.dto.AuthRequest;
import com.university.erp.dto.AuthResponse;
import com.university.erp.dto.RegisterRequest;
import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.model.Student;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.security.defense.RiskScoringService;
import com.university.erp.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import com.university.erp.dto.GoogleAuthRequest;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Value;
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
    private final com.university.erp.repository.LoginLogRepository loginLogRepository;
    private final com.university.erp.repository.AuditLogRepository auditLogRepository;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
            RoleRepository roleRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils, RefreshTokenService refreshTokenService,
            BruteForceProtectionService bruteForceProtectionService, RiskScoringService riskScoringService,
            com.university.erp.repository.LoginLogRepository loginLogRepository,
            com.university.erp.repository.AuditLogRepository auditLogRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.bruteForceProtectionService = bruteForceProtectionService;
        this.riskScoringService = riskScoringService;
        this.loginLogRepository = loginLogRepository;
        this.auditLogRepository = auditLogRepository;
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
                    .mustChangePassword(true)
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

            User user = (User) authentication.getPrincipal();
            
            // Check if account is locked or deactivated
            if (!"active".equalsIgnoreCase(user.getAccountStatus())) {
                String status = user.getAccountStatus();
                recordLoginLog(user, username, clientIp, "FAILURE", "Account " + status);
                throw new RuntimeException("Account " + status + ". Please contact admin.");
            }

            log.info("Authentication successful. Building session for user ID: {}", user.getUserId());
            
            // Reset failed attempts on success
            user.setFailedLoginAttempts(0);
            user.setLastLogin(java.time.LocalDateTime.now());
            userRepository.save(user);

            bruteForceProtectionService.loginSucceeded(username);
            bruteForceProtectionService.loginSucceededByIp(clientIp);
            
            recordLoginLog(user, username, clientIp, "SUCCESS", "Login successful");

            String jwt = jwtUtils.generateToken(user);
            com.university.erp.model.RefreshToken refreshToken = refreshTokenService
                    .createRefreshToken(user.getUserId());

            String roleName = user.getRole() != null && user.getRole().getRoleName() != null
                    ? user.getRole().getRoleName().name()
                    : "STUDENT";

            return AuthResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getUserId())
                    .username(user.getUsername())
                    .role(roleName)
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .mustChangePassword(user.isMustChangePassword())
                    .studentId(user.getLinkedStudent() != null ? user.getLinkedStudent().getId() : null)
                    .registerNo(user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : null)
                    .build();
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn("Authentication failed for user {}: {}", username, e.getMessage());
            
            // Handle failed attempt in DB for brute force protection
            userRepository.findByUsername(username).ifPresent(u -> {
                int attempts = u.getFailedLoginAttempts() + 1;
                u.setFailedLoginAttempts(attempts);
                if (attempts >= 5) {
                    u.setAccountStatus("locked");
                    log.warn("User account {} has been locked due to 5 failed attempts.", username);
                }
                userRepository.save(u);
                recordLoginLog(u, username, clientIp, "FAILURE", "Invalid credentials");
            });

            bruteForceProtectionService.loginFailed(username);
            if (clientIp != null) {
                bruteForceProtectionService.loginFailedByIp(clientIp);
                riskScoringService.recordFailedAuth(clientIp);
            }
            throw new RuntimeException("Invalid username or password.");
        } catch (Exception e) {
            log.error("CRITICAL: Login process failed for user {}: {}", username, e.getMessage());
            throw new RuntimeException("An error occurred during authentication.");
        }
    }

    private void recordLoginLog(User user, String username, String ip, String status, String reason) {
        try {
            com.university.erp.model.LoginLog logEntry = com.university.erp.model.LoginLog.builder()
                    .user(user)
                    .username(username)
                    .ipAddress(ip)
                    .loginTime(java.time.LocalDateTime.now())
                    .status(status)
                    .reason(reason)
                    .build();
            loginLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.warn("Failed to record login log: {}", ex.getMessage());
        }
    }

    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        log.info("Attempting Firebase Google login");
        try {
            // Verify Firebase ID Token using Firebase Admin SDK
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getToken());
            if (decodedToken == null) {
                throw new RuntimeException("Invalid Firebase ID Token");
            }

            String email = decodedToken.getEmail();
            String googleId = decodedToken.getUid();

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    userRepository.save(user);
                    log.info("Linked Firebase Google account for user: {}", email);
                }
            } else {
                // Auto-registration logic for users with institutional emails
                if (!email.toLowerCase().matches("^[\\w.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\\.)*ritchennai\\.edu\\.in$")) {
                    throw new RuntimeException(
                            "Google account must use an institutional email (@ritchennai.edu.in or @dept.ritchennai.edu.in).");
                }

                log.info("User {} not found, performing auto-registration for student.", email);
                Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                        .orElseThrow(() -> new RuntimeException("Default student role not configured."));

                // Try to extract register number from email prefix (e.g. 2117240020044 or firstname.2117240020044)
                String prefix = email.split("@")[0];
                String registerNo = null;
                if (prefix.matches("^\\d+$")) {
                    registerNo = prefix;
                } else if (prefix.contains(".")) {
                    String[] parts = prefix.split("\\.");
                    String lastPart = parts[parts.length - 1];
                    if (lastPart.matches("^\\d+$")) {
                        registerNo = lastPart;
                    }
                }
                
                String fullName = (String) decodedToken.getClaims().get("name");
                String firstName = "Student";
                String lastName = "";
                if (fullName != null && !fullName.isBlank()) {
                    String[] parts = fullName.split(" ", 2);
                    firstName = parts[0];
                    if (parts.length > 1) lastName = parts[1];
                }

                user = User.builder()
                        .username(email)
                        .email(email)
                        .googleId(googleId)
                        .firstName(firstName)
                        .lastName(lastName)
                        .password(passwordEncoder.encode("FIREBASE_USER_" + googleId)) // Placeholder password
                        .role(studentRole)
                        .accountStatus("active")
                        .mustChangePassword(false)
                        .build();

                user = userRepository.save(user);
                log.info("Created new user account for: {}", email);

                Student newStudent = Student.builder()
                        .user(user)
                        .registerNo(registerNo)
                        .studentIdNumber("F-" + (registerNo != null ? registerNo : googleId.substring(0, 10)))
                        .studentName(user.getFirstName() + " " + user.getLastName())
                        .email(email)
                        .status("active")
                        .build();

                studentRepository.save(newStudent);
                log.info("Auto-registered new student record for: {}", email);

                user.setLinkedStudent(newStudent);
                userRepository.save(user);
            }

            String jwt = jwtUtils.generateToken(user);
            com.university.erp.model.RefreshToken refreshToken = refreshTokenService
                    .createRefreshToken(user.getUserId());
            log.info("Firebase Google login successful for user: {}", user.getUsername());

            return AuthResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getUserId())
                    .username(user.getUsername())
                    .role(user.getRole().getRoleName().name())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .mustChangePassword(user.isMustChangePassword())
                    .studentId(user.getLinkedStudent() != null ? user.getLinkedStudent().getId() : null)
                    .registerNo(user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : null)
                    .build();

        } catch (Exception e) {
            log.error("Firebase Google login failed: {}", e.getMessage());
            throw new RuntimeException("Firebase Google authentication failed: " + e.getMessage());
        }
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (request.getEmail() == null || !request.getEmail().toLowerCase()
                .matches("^[\\w.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\\.)*ritchennai\\.edu\\.in$")) {
            throw new RuntimeException(
                    "Error: Registration is restricted to institutional email addresses (@ritchennai.edu.in or @dept.ritchennai.edu.in).");
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
        user.setMustChangePassword(false);
        user.setLastPasswordChange(java.time.LocalDateTime.now());
        userRepository.save(user);

        // Record Audit Log
        recordAuditLog(user, "CHANGE_PASSWORD", "User changed their own password", user.getUserId(), null);
    }

    private void recordAuditLog(User actor, String action, String details, Long affectedUserId, String ip) {
        try {
            com.university.erp.model.AuditLog auditEntry = com.university.erp.model.AuditLog.builder()
                    .actor(actor)
                    .action(action)
                    .details(details)
                    .affectedUserId(affectedUserId)
                    .ipAddress(ip)
                    .actionTime(java.time.LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditEntry);
        } catch (Exception ex) {
            log.warn("Failed to record audit log: {}", ex.getMessage());
        }
    }

    public AuthResponse refreshToken(com.university.erp.dto.TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.university.erp.model.RefreshToken::getUser)
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
                            .mustChangePassword(user.isMustChangePassword())
                            .studentId(user.getLinkedStudent() != null ? user.getLinkedStudent().getId() : null)
                            .registerNo(user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : null)
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
}
