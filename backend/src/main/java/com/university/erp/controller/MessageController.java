package com.university.erp.controller;

import com.university.erp.model.ErpMessage;
import com.university.erp.model.User;
import com.university.erp.repository.ErpMessageRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.util.ErpException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ErpMessageRepository messageRepository;
    private final UserRepository userRepository;

    @GetMapping("/inbox")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getInbox() {
        User user = currentUser();
        List<ErpMessage> messages = messageRepository.findByRecipient_IdOrderBySentAtDesc(user.getId());
        return ResponseEntity.ok(messages.stream().map(this::toDto).toList());
    }

    @GetMapping("/outbox")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getOutbox() {
        User user = currentUser();
        List<ErpMessage> messages = messageRepository.findBySender_IdOrderBySentAtDesc(user.getId());
        return ResponseEntity.ok(messages.stream().map(this::toDto).toList());
    }

    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, String> payload) {
        User sender = currentUser();
        String to = payload.get("to");
        String subject = payload.get("subject");
        String content = payload.get("content");

        if (to == null || to.isBlank() || subject == null || subject.isBlank() || content == null || content.isBlank()) {
            throw new ErpException.InvalidOperationException("Recipient, subject, and content are required.");
        }

        // Find recipient by email or username, or fallback to first admin
        User recipient = userRepository.findByEmailIgnoreCase(to.trim())
                .or(() -> userRepository.findByUsernameIgnoreCase(to.trim()))
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Recipient user not found: " + to));

        ErpMessage msg = ErpMessage.builder()
                .sender(sender)
                .recipient(recipient)
                .subject(subject)
                .content(content)
                .isRead(false)
                .folder("INBOX")
                .sentAt(LocalDateTime.now())
                .build();

        ErpMessage saved = messageRepository.save(msg);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "messageId", saved.getId(),
                "message", "Message sent successfully."
        ));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        User user = currentUser();
        ErpMessage msg = messageRepository.findById(id)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Message not found"));

        if (!msg.getRecipient().getId().equals(user.getId())) {
            throw new ErpException.InvalidOperationException("Cannot update another user's message.");
        }

        msg.setIsRead(true);
        messageRepository.save(msg);
        return ResponseEntity.ok(Map.of("success", true, "isRead", true));
    }

    private Map<String, Object> toDto(ErpMessage m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("sender", m.getSender() != null ? (m.getSender().getFirstName() + " " + m.getSender().getLastName()) : "University System");
        map.put("receiver", m.getRecipient() != null ? (m.getRecipient().getFirstName() + " " + m.getRecipient().getLastName()) : "User");
        map.put("subject", m.getSubject());
        map.put("preview", m.getContent() != null && m.getContent().length() > 60 ? m.getContent().substring(0, 60) + "..." : m.getContent());
        map.put("content", m.getContent());
        map.put("time", m.getSentAt() != null ? m.getSentAt().toString() : "Recent");
        map.put("unread", !Boolean.TRUE.equals(m.getIsRead()));
        return map;
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
