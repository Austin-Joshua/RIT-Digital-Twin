package com.university.erp.service;

import com.university.erp.model.Notification;
import com.university.erp.model.User;
import com.university.erp.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationRepository notificationRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
    }

    @SuppressWarnings("null")
    public void sendGlobalNotification(@org.springframework.lang.NonNull String message) {
        java.util.Objects.requireNonNull(message, "message must not be null");
        Notification notification = Notification.builder()
                .content(java.util.Objects.requireNonNull(message, "message must not be null"))
                .type("GLOBAL")
                .isRead(false)
                .build();
        java.util.Objects.requireNonNull(notification, "notification must not be null");
        notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications", java.util.Objects.requireNonNull(message, "message must not be null"));
    }

    public void sendUserNotification(@org.springframework.lang.NonNull User user, @org.springframework.lang.NonNull String message) {
        java.util.Objects.requireNonNull(user, "user must not be null");
        java.util.Objects.requireNonNull(message, "message must not be null");
        Notification notification = Notification.builder()
                .recipient(user)
                .content(message)
                .type("PERSONAL")
                .isRead(false)
                .build();
        java.util.Objects.requireNonNull(notification, "notification must not be null");
        notificationRepository.save(notification);
        java.util.Objects.requireNonNull(user.getUsername(), "username must not be null");
        messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", java.util.Objects.requireNonNull(message, "message must not be null"));
    }
}
