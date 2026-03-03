package com.university.erp.service;

import com.university.erp.entity.Notification;
import com.university.erp.entity.User;
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
