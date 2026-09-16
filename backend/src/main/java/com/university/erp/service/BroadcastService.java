package com.university.erp.service;

import com.university.erp.model.AuditLog;
import com.university.erp.model.Broadcast;
import com.university.erp.model.User;
import com.university.erp.repository.AuditLogRepository;
import com.university.erp.repository.BroadcastRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.util.ErpException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BroadcastService {

    private final BroadcastRepository broadcastRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final Set<String> ALLOWED_PRIORITIES = Set.of("INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL", "EMERGENCY");
    private static final Set<String> ALLOWED_AUDIENCES = Set.of("ALL", "STUDENT", "STUDENTS", "FACULTY", "FACULTIES", "HOD", "HODS", "ADMIN");

    @Transactional
    public Broadcast createBroadcast(
            String title,
            String message,
            String priority,
            String audience,
            String creatorUsername,
            String clientIp) {

        if (title == null || title.isBlank()) {
            throw new ErpException.BadRequestException("Broadcast title is required.");
        }
        if (title.length() > 255) {
            throw new ErpException.BadRequestException("Broadcast title exceeds maximum length of 255 characters.");
        }
        if (message == null || message.isBlank()) {
            throw new ErpException.BadRequestException("Broadcast message content is required.");
        }

        String safePriority = (priority != null && !priority.isBlank()) ? priority.trim().toUpperCase(Locale.ROOT) : "INFO";
        if (!ALLOWED_PRIORITIES.contains(safePriority)) {
            safePriority = "INFO";
        }

        String safeAudience = (audience != null && !audience.isBlank()) ? audience.trim().toUpperCase(Locale.ROOT) : "ALL";
        if (!ALLOWED_AUDIENCES.contains(safeAudience)) {
            safeAudience = "ALL";
        }

        String username = (creatorUsername != null && !creatorUsername.isBlank()) ? creatorUsername : "SYSTEM";

        Broadcast broadcast = Broadcast.builder()
                .title(title.trim())
                .message(message.trim())
                .priority(safePriority.toLowerCase(Locale.ROOT))
                .createdBy(username)
                .active(true)
                .audience(safeAudience)
                .build();

        Broadcast saved = broadcastRepository.save(broadcast);

        // Tamper-evident institutional audit
        User actor = userRepository.findByUsername(username).orElse(null);
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action("EMIT_BROADCAST")
                .actionTime(LocalDateTime.now())
                .details(String.format("Broadcast ID: %d, Title: '%s', Priority: %s, Audience: %s",
                        saved.getId(), saved.getTitle(), saved.getPriority(), saved.getAudience()))
                .ipAddress(clientIp)
                .build());

        // Real-time dispatch to WebSocket broker
        Map<String, Object> wsPayload = new LinkedHashMap<>();
        wsPayload.put("id", saved.getId());
        wsPayload.put("title", saved.getTitle());
        wsPayload.put("message", saved.getMessage());
        wsPayload.put("priority", saved.getPriority());
        wsPayload.put("audience", saved.getAudience());
        wsPayload.put("createdBy", saved.getCreatedBy());
        wsPayload.put("isLive", true);
        wsPayload.put("timestamp", String.valueOf(System.currentTimeMillis()));

        messagingTemplate.convertAndSend("/topic/broadcasts", wsPayload);

        return saved;
    }

    @Transactional
    public boolean deactivateBroadcast(Long id) {
        Optional<Broadcast> opt = broadcastRepository.findById(id);
        if (opt.isPresent()) {
            Broadcast b = opt.get();
            b.setActive(false);
            broadcastRepository.save(b);
            return true;
        }
        return false;
    }

    public List<Broadcast> getActiveBroadcasts(String role) {
        if (role == null || role.isBlank() || "ALL".equalsIgnoreCase(role)) {
            return broadcastRepository.findByAudienceInAndActiveTrueOrderByCreatedAtDesc(List.of("ALL"));
        }
        String cleanRole = role.toUpperCase(Locale.ROOT).replace("ROLE_", "");
        return broadcastRepository.findByAudienceInAndActiveTrueOrderByCreatedAtDesc(
                List.of("ALL", cleanRole, cleanRole + "S")
        );
    }

    public List<Broadcast> getAllBroadcasts() {
        return broadcastRepository.findAll();
    }
}
