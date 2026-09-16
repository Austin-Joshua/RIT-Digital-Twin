package com.university.erp.controller;

import com.university.erp.model.Broadcast;
import com.university.erp.service.BroadcastService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BroadcastController {

    private final BroadcastService broadcastService;

    @GetMapping("/api/broadcasts/active")
    public ResponseEntity<List<Broadcast>> getActiveBroadcasts(Authentication auth) {
        String role = "ALL";
        if (auth != null && auth.isAuthenticated()) {
            role = auth.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("ALL");
        }
        return ResponseEntity.ok(broadcastService.getActiveBroadcasts(role));
    }

    @GetMapping("/api/broadcasts")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<Broadcast>> getAllBroadcasts() {
        return ResponseEntity.ok(broadcastService.getAllBroadcasts());
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
        String clientIp = request != null ? request.getRemoteAddr() : "127.0.0.1";

        Broadcast saved = broadcastService.createBroadcast(title, message, priority, audience, username, clientIp);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/api/broadcasts/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateBroadcast(@PathVariable Long id) {
        boolean deactivated = broadcastService.deactivateBroadcast(id);
        if (deactivated) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Authoritative STOMP handler delegates directly to BroadcastService
    @MessageMapping("/broadcast")
    @SendTo("/topic/broadcasts")
    public Map<String, Object> handleGlobalBroadcast(Map<String, Object> payload, Principal principal) {
        String title = String.valueOf(payload.getOrDefault("title", "Campus Broadcast"));
        String msg = String.valueOf(payload.getOrDefault("message", ""));
        String priority = String.valueOf(payload.getOrDefault("priority", "info"));
        String sender = (principal != null) ? principal.getName() : String.valueOf(payload.getOrDefault("sender", "ADMIN"));

        Broadcast saved = broadcastService.createBroadcast(title, msg, priority, "ALL", sender, "127.0.0.1");

        payload.put("id", saved.getId());
        payload.put("timestamp", String.valueOf(System.currentTimeMillis()));
        payload.put("isLive", true);
        return payload;
    }
}
