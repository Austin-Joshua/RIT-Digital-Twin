package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Notification;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.repository.NotificationRepository;
import com.rit.digitaltwin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification broadcastGlobal(String title, String message, String type) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/global", saved);
        return saved;
    }

    public Notification sendToUser(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        messagingTemplate.convertAndSendToUser(userId.toString(), "/topic/notifications", saved);
        return saved;
    }

    public List<Notification> getMyNotifications(Long userId) {
        List<Notification> userNotifs = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        List<Notification> globalNotifs = notificationRepository.findByUserIsNullOrderByCreatedAtDesc();
        userNotifs.addAll(globalNotifs);
        return userNotifs;
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}
