package com.university.erp.service;

import com.university.erp.model.Notification;
import com.university.erp.model.User;
import com.university.erp.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationRepository notificationRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
    }

    /** Push to all connected clients (all logins) - shown as toast in UI */
    public void sendBroadcast(String title, String message) {
        messagingTemplate.convertAndSend("/topic/broadcasts", Map.of(
            "title", title != null ? title : "Update",
            "message", message != null ? message : "",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }

    public void sendGlobalNotification(String message) {
        Notification notification = Notification.builder()
                .content(message)
                .type("GLOBAL")
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications", message);
    }

    public void sendUserNotification(User user, String message) {
        Notification notification = Notification.builder()
                .recipient(user)
                .content(message)
                .type("PERSONAL")
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", message);
    }
}
