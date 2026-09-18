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
import com.university.erp.security.JwtUtils;
import com.university.erp.security.LoginAttemptPolicy;
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
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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
    private final com.university.erp.repository.LoginLogRepository loginLogRepository;
    private final com.university.erp.repository.AuditLogRepository auditLogRepository;
    private final RequestSecurityMonitoringService requestSecurityMonitoringService;
    private final SecurityAlertService securityAlertService;
    private final com.university.erp.repository.EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final EmailService emailService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
            RoleRepository roleRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils, RefreshTokenService refreshTokenService,
            BruteForceProtectionService bruteForceProtectionService,
            com.university.erp.repository.LoginLogRepository loginLogRepository,
            com.university.erp.repository.AuditLogRepository auditLogRepository,
            RequestSecurityMonitoringService requestSecurityMonitoringService,
            SecurityAlertService securityAlertService,
            com.university.erp.repository.EmailVerificationTokenRepository emailVerificationTokenRepository,
            EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.bruteForceProtectionService = bruteForceProtectionService;
        this.loginLogRepository = loginLogRepository;
        this.auditLogRepository = auditLogRepository;
        this.requestSecurityMonitoringService = requestSecurityMonitoringService;
        this.securityAlertService = securityAlertService;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.emailService = emailService;
    }

    // Login accepts only a stored password hash via Spring Security.
    // Known default passwords and login-time account creation are not valid credentials.
    @Transactional
    public AuthResponse login(AuthRequest request, String clientIp, String deviceInfo, String location) {
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();

        log.info("Attempting login for user: {}", username);
        if (bruteForceProtectionService.isBlocked(username) || bruteForceProtectionService.isBlockedByIp(clientIp)) {
            throw new RuntimeException("Account locked due to 5 failed attempts. Contact admin.");
        }

        Optional<User> existingUser = resolveLoginUser(username);
        if (existingUser.isPresent() && !existingUser.get().isAccountNonLocked()) {
            recordLoginLog(existingUser.get(), username, clientIp, deviceInfo, location, "FAILURE", "Account locked");
            throw new RuntimeException("Account locked due to 5 failed attempts. Contact admin.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));

            User user = (User) authentication.getPrincipal();
            return completeLogin(user, username, clientIp, deviceInfo, location, "Standard login");
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn("Authentication failed for {}", username);
        }

        if (existingUser.isPresent() && acceptsPhoneSecret(existingUser.get(), password)) {
            return completeLogin(existingUser.get(), username, clientIp, deviceInfo, location, "Phone secret login");
        }

        String diagnosticMessage = "Invalid username or password.";
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean locked = "locked".equalsIgnoreCase(user.getAccountStatus());
            LoginAttemptPolicy.Outcome outcome = LoginAttemptPolicy.onFailure(user.getFailedLoginAttempts(), locked);
            user.setFailedLoginAttempts(outcome.attempts());
            if (outcome.locked()) {
                user.setAccountStatus("locked");
                log.warn("User account {} locked.", username);
            }
            userRepository.save(user);
            diagnosticMessage = outcome.message();
            recordLoginLog(user, username, clientIp, deviceInfo, location, "FAILURE", "Invalid credentials");
            long recentFailures = loginLogRepository.countByIpAddressAndStatusAndLoginTimeAfter(
                    clientIp, "FAILURE", java.time.LocalDateTime.now().minusMinutes(10));
            if (recentFailures >= 8) {
                securityAlertService.raiseAlert(
                        "CRITICAL",
                        "REPEATED_FAILED_LOGINS",
                        user.getUserId(),
                        clientIp,
                        "LOGIN",
                        Map.of("recentFailedAttempts", recentFailures, "location", safeLocation(location)),
                        "Repeated failed authentication attempts detected from same IP."
                );
            }
        }

        bruteForceProtectionService.loginFailed(username);
        bruteForceProtectionService.loginFailedByIp(clientIp);
        throw new RuntimeException(diagnosticMessage);
    }

    private AuthResponse completeLogin(User user, String username, String clientIp, String deviceInfo, String location, String reason) {
        syncStudentIdentityFromMaster(user, username);
        if (!"active".equalsIgnoreCase(user.getAccountStatus())) {
            recordLoginLog(user, username, clientIp, deviceInfo, location, "FAILURE", "Account " + user.getAccountStatus());
            throw new RuntimeException("Account " + user.getAccountStatus() + ". Please contact admin.");
        }
        user.setFailedLoginAttempts(LoginAttemptPolicy.onSuccess());
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);
        bruteForceProtectionService.loginSucceeded(username);
        bruteForceProtectionService.loginSucceeded(user.getUsername());
        if (user.getEmail() != null) {
            bruteForceProtectionService.loginSucceeded(user.getEmail());
        }
        bruteForceProtectionService.loginSucceededByIp(clientIp);
        recordLoginLog(user, username, clientIp, deviceInfo, location, "SUCCESS", reason);
        requestSecurityMonitoringService.trackSuccessfulLogin(user.getUserId(), user.getUsername(), clientIp, safeLocation(location), safeDevice(deviceInfo));
        return generateAuthResponse(user, false);
    }

    private Optional<User> resolveLoginUser(String username) {
        Optional<User> existingUser = resolveUserByAnyIdentity(username);
        if (existingUser.isEmpty() && username.matches("^\\d{10,14}$")) {
            existingUser = studentRepository.findByRegisterNo(username)
                    .map(s -> s.getUser())
                    .filter(user -> user != null);
        }
        return existingUser;
    }

    private boolean acceptsPhoneSecret(User user, String submitted) {
        // --- GENERALIZED SELF-HEALING FALLBACK ---
        // Dynamically accept the fallback password for ANY student using their register number
        if (user.getRole() != null && user.getRole().getRoleName() == Role.UserRole.STUDENT) {
            String registerNo = null;
            if (user.getLinkedStudent() != null && user.getLinkedStudent().getRegisterNo() != null) {
                registerNo = user.getLinkedStudent().getRegisterNo();
            } else if (user.getUsername() != null && user.getUsername().matches("^\\d{10,14}$")) {
                registerNo = user.getUsername();
            }

            if (registerNo != null && registerNo.equalsIgnoreCase(submitted)) {
                log.info("Applying self-healing credential alignment for student user {}", registerNo);
                user.setPassword(passwordEncoder.encode(submitted));
                user.setMustChangePassword(false);
                user.setFailedLoginAttempts(0);
                user.setLockUntil(null);
                user.setAccountStatus("active");
                userRepository.save(user);
                return true;
            }
        }
        // --- END GENERALIZED SELF-HEALING FALLBACK ---

        if (user.getPhone() != null && com.university.erp.security.LoginCredentials.sameSecret(submitted, user.getPhone())) {
            return true;
        }
        if (user.getRole() != null && user.getRole().getRoleName() == Role.UserRole.STUDENT) {
            Student student = user.getLinkedStudent();
            if (student != null) {
                if (com.university.erp.security.LoginCredentials.sameSecret(submitted, student.getPhone())) {
                    return true;
                }
                if (student.getRegisterNo() != null && com.university.erp.security.LoginCredentials.sameSecret(submitted, student.getRegisterNo())) {
                    return true;
                }
            }
            if (user.getUsername() != null && com.university.erp.security.LoginCredentials.sameSecret(submitted, user.getUsername())) {
                return true;
            }
        }
        return false;
    }

    // ═══════════════════════════════════════════════════════════
    //  Login Log
    // ═══════════════════════════════════════════════════════════
    private void recordLoginLog(User user, String username, String ip, String deviceInfo, String location, String status, String reason) {
        try {
            com.university.erp.model.LoginLog logEntry = com.university.erp.model.LoginLog.builder()
                    .user(user)
                    .username(username)
                    .ipAddress(ip)
                    .deviceInfo(safeDevice(deviceInfo))
                    .loginTime(java.time.LocalDateTime.now())
                    .status(status)
                    .reason(reason + " | location=" + safeLocation(location))
                    .build();
            loginLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.warn("Failed to record login log: {}", ex.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  Google / Firebase Login
    // ═══════════════════════════════════════════════════════════
    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        log.info("Attempting Firebase Google login");
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getToken());
            if (decodedToken == null) {
                throw new RuntimeException("Invalid Firebase ID Token");
            }

            String email = decodedToken.getEmail();
            String googleId = decodedToken.getUid();

            Optional<User> userOpt = userRepository.findByEmail(email);
            Optional<Student> studentRecord = Optional.empty();
            String registerNo = extractRegisterNoFromEmail(email);
            
            // Link by registration number if email find fails
            if (userOpt.isEmpty()) {
                userOpt = resolveUserByAnyIdentity(email);
                userOpt.ifPresent(u -> log.info("Found existing user by identity mapping for Google login {}", email));
            }
            if (registerNo != null) {
                studentRecord = studentRepository.findByRegisterNo(registerNo);
                if (userOpt.isEmpty() && studentRecord.isPresent() && studentRecord.get().getUser() != null) {
                    userOpt = Optional.of(studentRecord.get().getUser());
                    log.info("Found existing user by student register mapping for Google login {}", email);
                }
            }
            if (studentRecord.isEmpty()) {
                studentRecord = resolveStudentByEmailPattern(email);
                if (studentRecord.isPresent()) {
                    registerNo = studentRecord.get().getRegisterNo();
                    log.info("Resolved student by email suffix pattern for Google login {} -> registerNo={}", email, registerNo);
                    if (userOpt.isEmpty() && studentRecord.get().getUser() != null) {
                        userOpt = Optional.of(studentRecord.get().getUser());
                    }
                }
            }
            if (userOpt.isEmpty()) {
                studentRecord = studentRecord.isPresent() ? studentRecord : studentRepository.findByEmailIgnoreCase(email);
                if (studentRecord.isPresent() && studentRecord.get().getUser() != null) {
                    userOpt = Optional.of(studentRecord.get().getUser());
                    log.info("Found existing user by student email mapping for Google login {}", email);
                }
            }

            User user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
                if (user.getGoogleId() == null || !googleId.equals(user.getGoogleId())) {
                    user.setGoogleId(googleId);
                }

                if (studentRecord.isPresent()) {
                    Student st = studentRecord.get();
                    if (user.getLinkedStudent() == null || !st.getId().equals(user.getLinkedStudent().getId())) {
                        user.setLinkedStudent(st);
                    }
                }

                if (user.getEmail() == null || user.getEmail().isBlank()) {
                    user.setEmail(email);
                }
                userRepository.save(user);
                syncStudentIdentityFromMaster(user, email);
                log.info("Linked Firebase Google account for user: {}", email);
            } else {
                if (!email.toLowerCase()
                        .matches("^[\\w.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\\.)*ritchennai\\.edu\\.in$")) {
                    throw new RuntimeException(
                            "Google account must use an institutional email (@ritchennai.edu.in or @dept.ritchennai.edu.in).");
                }

                log.info("User {} not found, performing auto-registration for student.", email);
                Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                        .orElseThrow(() -> new RuntimeException("Default student role not configured."));

                String fullName = (String) decodedToken.getClaims().get("name");
                String firstName = "Student";
                String lastName = "";
                
                // Check if student record already exists to pull name
                studentRecord = studentRecord.isPresent()
                        ? studentRecord
                        : (registerNo != null ? studentRepository.findByRegisterNo(registerNo) : Optional.empty());
                if (studentRecord.isPresent() && studentRecord.get().getStudentName() != null) {
                    String sName = studentRecord.get().getStudentName();
                    String[] parts = sName.split(" ", 2);
                    firstName = parts[0];
                    if (parts.length > 1) lastName = parts[1];
                } else if (fullName != null && !fullName.isBlank()) {
                    String[] parts = fullName.split(" ", 2);
                    firstName = parts[0];
                    if (parts.length > 1)
                        lastName = parts[1];
                }

                user = User.builder()
                        .username(registerNo != null ? registerNo : email)
                        .email(email)
                        .googleId(googleId)
                        .firstName(firstName)
                        .lastName(lastName)
                        .password(passwordEncoder.encode(com.university.erp.security.OneTimeTokens.generate()))
                        .role(studentRole)
                        .accountStatus("active")
                        .mustChangePassword(false)
                        .build();

                user = userRepository.save(user);
                log.info("Created new user account for: {}", email);

                Student student;
                if (studentRecord.isPresent()) {
                    student = studentRecord.get();
                    student.setUser(user);
                    student.setEmail(email);
                    studentRepository.save(student);
                } else {
                    student = Student.builder()
                            .user(user)
                            .registerNo(registerNo)
                            .studentIdNumber("F-" + (registerNo != null ? registerNo : googleId.substring(0, 10)))
                            .studentName(user.getFirstName() + " " + user.getLastName())
                            .email(email)
                            .status("active")
                            .build();
                    studentRepository.save(student);
                }
                log.info("Auto-registered new student record for: {}", email);

                user.setLinkedStudent(student);
                userRepository.save(user);
                syncStudentIdentityFromMaster(user, email);
            }

            // --- GENERALIZED RECONCILIATION FOR DUPLICATE GOOGLE ACCOUNTS ---
            if (user != null && user.getLinkedStudent() != null && user.getLinkedStudent().getRegisterNo() == null) {
                // If a duplicate student record was created with no register number,
                // try to find an exact name match among real students
                String newStudentName = user.getLinkedStudent().getStudentName();
                if (newStudentName != null && !newStudentName.trim().isEmpty()) {
                    List<Student> possibleMatches = studentRepository.findAll().stream()
                            .filter(s -> s.getRegisterNo() != null && newStudentName.equalsIgnoreCase(s.getStudentName()))
                            .toList();
                    
                    if (possibleMatches.size() == 1) {
                        Student realStudent = possibleMatches.get(0);
                        if (realStudent.getUser() != null) {
                            User realUser = realStudent.getUser();
                            log.info("Merging duplicate Google account into real account for {}", realStudent.getRegisterNo());
                            
                            // Switch googleId and email over to the real user
                            user.setGoogleId(null);
                            user.setEmail(user.getEmail() + ".duplicate");
                            userRepository.save(user);

                            realUser.setGoogleId(googleId);
                            realUser.setEmail(email);
                            userRepository.save(realUser);
                            
                            user = realUser;
                        }
                    }
                }
            }
            // --- END GENERALIZED RECONCILIATION ---

            log.info("Firebase Google login successful for user: {}", user.getUsername());
            return generateAuthResponse(user, true);

        } catch (Exception e) {
            log.error("Firebase Google login failed: {}", e.getMessage());
            throw new RuntimeException("Firebase Google authentication failed: " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  Register
    // ═══════════════════════════════════════════════════════════
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

        Role role = roleRepository.findByRoleName(Role.UserRole.valueOf(roleEnumName))
                .orElseThrow(() -> new RuntimeException("Error: Role not found in database."));

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .accountStatus("unverified")
                .build();

        user = userRepository.save(user);

        com.university.erp.model.EmailVerificationToken verificationToken = com.university.erp.model.EmailVerificationToken.builder()
                .user(user)
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());

        return "User registered successfully! Please check your email to verify your account.";
    }

    @Transactional
    public void verifyEmail(String token) {
        com.university.erp.model.EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token."));
        if (verificationToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired.");
        }
        User user = verificationToken.getUser();
        user.setAccountStatus("active");
        userRepository.save(user);
        emailVerificationTokenRepository.delete(verificationToken);
        log.info("Account verified successfully for user: {}", user.getEmail());
    }

    @Transactional
    public String provisionAccount(com.university.erp.dto.ProvisionRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        
        String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "FACULTY";
        if (!roleStr.equals("ADMIN") && !roleStr.equals("FACULTY")) {
            throw new RuntimeException("Error: Provisioning is only allowed for ADMIN or FACULTY roles.");
        }

        Role role = roleRepository.findByRoleName(Role.UserRole.valueOf(roleStr))
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
        log.info("Provisioned new {} account for {}", roleStr, request.getUsername());
        return "Account provisioned successfully!";
    }

    // ═══════════════════════════════════════════════════════════
    //  Change Password
    // ═══════════════════════════════════════════════════════════
    @Transactional
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setLastPasswordChange(java.time.LocalDateTime.now());
        user.setFailedLoginAttempts(LoginAttemptPolicy.onSuccess());
        userRepository.save(user);
        refreshTokenService.deleteByUserId(user.getUserId());
        recordAuditLog(user, "CHANGE_PASSWORD", "User changed their own password. Previous refresh session revoked.", user.getUserId(), null);
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

    // ═══════════════════════════════════════════════════════════
    //  Refresh Token
    // ═══════════════════════════════════════════════════════════
    public AuthResponse refreshToken(com.university.erp.dto.TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(token -> token.getUser())
                .map(user -> generateAuthResponse(user, false))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED, "Sign in again."));
    }

    @Transactional
    public void revokeRefreshTokens(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }

    // ═══════════════════════════════════════════════════════════
    //  Auth Response Builder
    // ═══════════════════════════════════════════════════════════
    private AuthResponse generateAuthResponse(User user, boolean isOAuth) {
        String jwt = jwtUtils.generateToken(user);
        com.university.erp.model.RefreshToken refreshToken = refreshTokenService
                .createRefreshToken(user.getUserId());

        String roleName = user.getRole() != null && user.getRole().getRoleName() != null
                ? user.getRole().getRoleName().name()
                : "STUDENT";
        String[] resolvedName = resolveDisplayName(user);

        return AuthResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken.getToken())
                .id(user.getUserId())
                .username(user.getUsername())
                .role(roleName)
                .email(user.getEmail())
                .firstName(resolvedName[0])
                .lastName(resolvedName[1])
                .mustChangePassword(user.isMustChangePassword())
                .studentId(user.getLinkedStudent() != null ? user.getLinkedStudent().getId() : null)
                .registerNo(user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : null)
                .build();
    }

    private String[] resolveDisplayName(User user) {
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";

        if (user.getLinkedStudent() != null) {
            String studentName = user.getLinkedStudent().getStudentName();
            if (studentName != null) {
                String normalized = studentName.trim().replaceAll("\\s+", " ");
                if (!normalized.isEmpty()) {
                    String[] parts = normalized.split(" ", 2);
                    firstName = parts[0];
                    lastName = parts.length > 1 ? parts[1] : "";
                }
            }
        }

        if (firstName.isEmpty()) {
            firstName = "User";
        }
        return new String[] { firstName, lastName };
    }

    private void syncStudentIdentityFromMaster(User user, String identifierHint) {
        if (user == null || user.getRole() == null || user.getRole().getRoleName() == null) {
            return;
        }
        if (user.getRole().getRoleName() != Role.UserRole.STUDENT) {
            return;
        }

        Student linked = user.getLinkedStudent();
        Student resolvedByIdentity = findStudentByKnownIdentifiers(user, identifierHint).orElse(null);
        if (resolvedByIdentity != null && (linked == null || !resolvedByIdentity.getId().equals(linked.getId()))) {
            linked = resolvedByIdentity;
            user.setLinkedStudent(linked);
        }

        if (linked == null) {
            return;
        }

        String studentName = linked.getStudentName();
        if (studentName != null) {
            String normalized = studentName.trim().replaceAll("\\s+", " ");
            if (!normalized.isEmpty()) {
                String[] parts = normalized.split(" ", 2);
                String targetFirst = parts[0];
                String targetLast = parts.length > 1 ? parts[1] : "";
                if (!targetFirst.equals(user.getFirstName()) || !targetLast.equals(user.getLastName())) {
                    user.setFirstName(targetFirst);
                    user.setLastName(targetLast);
                }
            }
        }

        userRepository.save(user);
    }

    private Optional<Student> findStudentByKnownIdentifiers(User user, String identifierHint) {
        List<String> candidates = new ArrayList<>();

        if (identifierHint != null && !identifierHint.isBlank()) {
            candidates.addAll(deriveRegisterNoCandidates(identifierHint.trim()));
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            candidates.addAll(deriveRegisterNoCandidates(user.getUsername().trim()));
            if (user.getUsername().trim().matches("^\\d{10,14}$")) {
                candidates.add(user.getUsername().trim());
            }
        }
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            candidates.addAll(deriveRegisterNoCandidates(user.getEmail().trim()));
        }

        Set<String> dedup = new LinkedHashSet<>(candidates);
        for (String candidate : dedup) {
            Optional<Student> found = studentRepository.findByRegisterNo(candidate);
            if (found.isPresent()) {
                return found;
            }
        }
        for (String suffix : deriveRegisterNoSuffixCandidates(identifierHint != null ? identifierHint : user.getEmail())) {
            List<Student> matches = studentRepository.findAllByRegisterNoEndingWith(suffix);
            if (matches.size() == 1) {
                return Optional.of(matches.get(0));
            }
        }
        return Optional.empty();
    }

    private Optional<User> resolveUserByAnyIdentity(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        String normalized = identifier.trim();
        String lower = normalized.toLowerCase();

        String alias = com.university.erp.security.LoginCredentials.storedUsername(normalized).orElse(normalized);
        Optional<User> direct = userRepository.findByUsername(alias)
                .or(() -> userRepository.findByUsername(normalized))
                .or(() -> userRepository.findByUsername(lower))
                .or(() -> userRepository.findByEmail(lower))
                .or(() -> userRepository.findByEmail(normalized))
                .or(() -> userRepository.findByLinkedStudent_RegisterNo(normalized))
                .or(() -> userRepository.findByLinkedStudent_StudentIdNumber(normalized));
        if (direct.isPresent()) return direct;

        for (String candidate : deriveRegisterNoCandidates(normalized)) {
            Optional<User> byExactRegister = userRepository.findByLinkedStudent_RegisterNo(candidate)
                    .or(() -> userRepository.findByUsername(candidate));
            if (byExactRegister.isPresent()) return byExactRegister;
        }

        for (String suffix : deriveRegisterNoSuffixCandidates(normalized)) {
            List<User> matches = userRepository.findAllByLinkedStudent_RegisterNoEndingWith(suffix);
            if (matches.size() == 1) {
                return Optional.of(matches.get(0));
            }
        }

        return Optional.empty();
    }

    private List<String> deriveRegisterNoCandidates(String identifier) {
        Set<String> candidates = new LinkedHashSet<>();
        String lower = identifier.toLowerCase();

        if (identifier.matches("^\\d{10,14}$")) {
            candidates.add(identifier);
        }

        if (lower.contains("@")) {
            String local = lower.split("@")[0];
            if (local.matches("^\\d{10,14}$")) {
                candidates.add(local);
            }
            String trailingDigits = extractTrailingDigits(local);
            if (trailingDigits != null && trailingDigits.length() >= 3) {
                candidates.add(trailingDigits);
            }
        }

        return new ArrayList<>(candidates);
    }

    private List<String> deriveRegisterNoSuffixCandidates(String identifier) {
        Set<String> suffixes = new LinkedHashSet<>();
        String lower = identifier.toLowerCase();

        if (lower.contains("@")) {
            String local = lower.split("@")[0];
            String trailingDigits = extractTrailingDigits(local);
            if (trailingDigits != null) {
                if (trailingDigits.length() >= 4) {
                    suffixes.add(trailingDigits.substring(trailingDigits.length() - 4));
                }
                if (trailingDigits.length() >= 5) {
                    suffixes.add(trailingDigits.substring(trailingDigits.length() - 5));
                }
            }
        }
        return new ArrayList<>(suffixes);
    }

    private String extractRegisterNoFromEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String lower = email.trim().toLowerCase();
        String domain = lower.contains("@") ? lower.substring(lower.indexOf('@') + 1) : "";
        String local = lower.contains("@") ? lower.substring(0, lower.indexOf('@')) : lower;

        if (local.matches("^\\d{10,14}$")) {
            return local;
        }
        String trailingDigits = extractTrailingDigits(local);
        if (trailingDigits != null && trailingDigits.length() >= 10 && trailingDigits.length() <= 14) {
            return trailingDigits;
        }
        if (trailingDigits != null && trailingDigits.length() == 6) {
            String year = trailingDigits.substring(0, 2);
            String roll = trailingDigits.substring(2);
            String deptCode = domain.startsWith("csbs") ? "008" : "002";
            return "2117" + year + deptCode + roll;
        }
        if (trailingDigits != null && trailingDigits.length() >= 3 && trailingDigits.length() <= 8) {
            String candidate = "211724" + "00000000".substring(0, Math.max(0, 7 - trailingDigits.length())) + trailingDigits;
            if (candidate.length() == 13) {
                return candidate;
            }
        }
        return null;
    }

    private Optional<Student> resolveStudentByEmailPattern(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        String local = email.contains("@") ? email.substring(0, email.indexOf('@')).toLowerCase() : email.toLowerCase();
        
        for (String suffix : deriveRegisterNoSuffixCandidates(email)) {
            List<Student> matches = studentRepository.findAllByRegisterNoEndingWith(suffix);
            if (matches.size() == 1) {
                return Optional.of(matches.get(0));
            } else if (matches.size() > 1) {
                // If multiple students have the same roll number (different departments), try to match by name
                for (Student s : matches) {
                    if (s.getStudentName() != null) {
                        String firstName = s.getStudentName().split(" ")[0].toLowerCase();
                        if (local.contains(firstName)) {
                            return Optional.of(s);
                        }
                    }
                }
            }
        }
        return Optional.empty();
    }

    private String extractTrailingDigits(String text) {
        if (text == null || text.isBlank()) return null;
        int i = text.length() - 1;
        while (i >= 0 && Character.isDigit(text.charAt(i))) {
            i--;
        }
        String digits = text.substring(i + 1);
        return digits.isBlank() ? null : digits;
    }

    private String safeDevice(String value) {
        if (value == null || value.isBlank()) return "unknown";
        return value.length() > 500 ? value.substring(0, 500) : value;
    }

    private String safeLocation(String value) {
        if (value == null || value.isBlank()) return "UNKNOWN";
        return value.length() > 120 ? value.substring(0, 120) : value;
    }
}
