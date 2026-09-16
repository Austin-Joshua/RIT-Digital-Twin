package com.university.erp.controller;

import com.university.erp.model.AuditLog;
import com.university.erp.model.Broadcast;
import com.university.erp.model.User;
import com.university.erp.repository.AuditLogRepository;
import com.university.erp.repository.BroadcastRepository;
import com.university.erp.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
public class BroadcastController {

    private final BroadcastRepository broadcastRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BroadcastController(
            BroadcastRepository broadcastRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.broadcastRepository = broadcastRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/api/broadcasts/active")
    public ResponseEntity<List<Broadcast>> getActiveBroadcasts(Authentication auth) {
        List<Broadcast> activeList;
        if (auth == null || !auth.isAuthenticated()) {
            activeList = broadcastRepository.findByAudienceInAndActiveTrueOrderByCreatedAtDesc(List.of("ALL"));
        } else {
            String role = auth.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("ALL");
            activeList = broadcastRepository.findByAudienceInAndActiveTrueOrderByCreatedAtDesc(List.of("ALL", role, role + "S"));
        }
        return ResponseEntity.ok(activeList);
    }

    @GetMapping("/api/broadcasts")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<Broadcast>> getAllBroadcasts() {
        return ResponseEntity.ok(broadcastRepository.findAll());
    }

    @PostMapping("/api/broadcasts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Broadcast> createBroadcast(
            @RequestBody Map<String, Object> payload,
            Authentication auth,
            HttpServletRequest request) {

        String title = (String) payload.getOrDefault("title", "Campus Announcement");
        String message = (String) payload.getOrDefault("message", "");
        String priority = (String) payload.getOrDefault("priority", "info");
        String audience = (String) payload.getOrDefault("audience", "ALL");

        String username = (auth != null) ? auth.getName() : "ADMIN";

        Broadcast broadcast = Broadcast.builder()
                .title(title)
                .message(message)
                .priority(priority)
                .createdBy(username)
                .active(true)
                .audience(audience.toUpperCase())
                .build();

        Broadcast saved = broadcastRepository.save(broadcast);

        // Audit broadcast emission
        User actor = userRepository.findByUsername(username).orElse(null);
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action("EMIT_BROADCAST")
                .actionTime(LocalDateTime.now())
                .details(String.format("Title: %s, Priority: %s, Audience: %s", title, priority, audience))
                .ipAddress(request.getRemoteAddr())
                .build());

        // Dispatch in real-time via WebSocket
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("id", saved.getId());
        wsPayload.put("title", saved.getTitle());
        wsPayload.put("message", saved.getMessage());
        wsPayload.put("priority", saved.getPriority());
        wsPayload.put("audience", saved.getAudience());
        wsPayload.put("createdBy", saved.getCreatedBy());
        wsPayload.put("isLive", true);
        wsPayload.put("timestamp", String.valueOf(System.currentTimeMillis()));

        messagingTemplate.convertAndSend("/topic/broadcasts", wsPayload);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/api/broadcasts/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateBroadcast(@PathVariable Long id) {
        return broadcastRepository.findById(id).map(b -> {
            b.setActive(false);
            broadcastRepository.save(b);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // Legacy STOMP socket endpoint preserved
    @MessageMapping("/broadcast")
    @SendTo("/topic/broadcasts")
    public Map<String, Object> handleGlobalBroadcast(Map<String, Object> payload) {
        String title = String.valueOf(payload.getOrDefault("title", "Campus Broadcast"));
        String msg = String.valueOf(payload.getOrDefault("message", ""));
        String priority = String.valueOf(payload.getOrDefault("priority", "info"));

        Broadcast broadcast = Broadcast.builder()
                .title(title)
                .message(msg)
                .priority(priority)
                .createdBy(String.valueOf(payload.getOrDefault("sender", "SYSTEM")))
                .active(true)
                .audience("ALL")
                .build();
        Broadcast saved = broadcastRepository.save(broadcast);

        payload.put("id", saved.getId());
        payload.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return payload;
    }
}
