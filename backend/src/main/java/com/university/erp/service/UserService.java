package com.university.erp.service;

import com.university.erp.entity.AuditLog;
import com.university.erp.entity.User;
import com.university.erp.repository.AuditLogRepository;
import com.university.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void unlockUser(Long userId, User actor, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setAccountStatus("active");
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        userRepository.save(user);

        recordAuditLog(actor, "UNLOCK_USER", "Admin unlocked account", userId, ip);
        log.info("User {} unlocked by admin {}", user.getUsername(), actor.getUsername());
    }

    @Transactional
    public void deactivateUser(Long userId, User actor, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setAccountStatus("deactivated");
        userRepository.save(user);

        recordAuditLog(actor, "DEACTIVATE_USER", "Admin deactivated account", userId, ip);
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword, User actor, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        recordAuditLog(actor, "RESET_PASSWORD_ADMIN", "Admin reset user password", userId, ip);
    }

    private void recordAuditLog(User actor, String action, String details, Long affectedUserId, String ip) {
        AuditLog auditEntry = AuditLog.builder()
                .actor(actor)
                .action(action)
                .details(details)
                .affectedUserId(affectedUserId)
                .ipAddress(ip)
                .actionTime(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditEntry);
    }
}
