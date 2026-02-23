package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.Notification;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my-notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(notificationService.getMyNotifications(user.getUserId()));
    }

    @PostMapping("/mark-read/{notificationId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // Admin only
    @PostMapping("/admin/broadcast")
    public ResponseEntity<Notification> broadcast(@RequestParam String title,
            @RequestParam String message,
            @RequestParam String type) {
        return ResponseEntity.ok(notificationService.broadcastGlobal(title, message, type));
    }
}
