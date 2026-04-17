package com.university.erp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.erp.model.SecurityAlert;
import com.university.erp.model.User;
import com.university.erp.repository.SecurityAlertRepository;
import com.university.erp.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
public class SecurityAlertService {

    private final SecurityAlertRepository securityAlertRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${app.security.alerts.telegram.enabled:false}")
    private boolean telegramEnabled;

    @Value("${app.security.alerts.telegram.bot-token:}")
    private String telegramBotToken;

    @Value("${app.security.alerts.telegram.chat-id:}")
    private String telegramChatId;

    public SecurityAlertService(
            SecurityAlertRepository securityAlertRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            RestTemplateBuilder restTemplateBuilder
    ) {
        this.securityAlertRepository = securityAlertRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder.build();
    }

    public void raiseAlert(
            String severity,
            String alertType,
            Long userId,
            String ipAddress,
            String action,
            Map<String, Object> changedValues,
            String message
    ) {
        try {
            User user = userId == null ? null : userRepository.findById(userId).orElse(null);
            SecurityAlert alert = SecurityAlert.builder()
                    .severity(safe(severity, "MEDIUM"))
                    .alertType(safe(alertType, "SECURITY_EVENT"))
                    .user(user)
                    .userIdRef(userId)
                    .ipAddress(ipAddress)
                    .actionName(action)
                    .changedValues(toJson(changedValues))
                    .message(message == null ? "Security anomaly detected." : message)
                    .resolved(false)
                    .build();
            securityAlertRepository.save(alert);
            pushTelegramAlert(alert);
        } catch (Exception ex) {
            log.warn("Unable to persist security alert: {}", ex.getMessage());
        }
    }

    private void pushTelegramAlert(SecurityAlert alert) {
        if (!telegramEnabled || telegramBotToken == null || telegramBotToken.isBlank()
                || telegramChatId == null || telegramChatId.isBlank()) {
            return;
        }
        String url = "https://api.telegram.org/bot" + telegramBotToken + "/sendMessage";
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("chat_id", telegramChatId);
        payload.put("text", formatAlertText(alert));
        payload.put("disable_web_page_preview", true);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), String.class);
        } catch (Exception ex) {
            log.warn("Telegram alert delivery failed: {}", ex.getMessage());
        }
    }

    private String formatAlertText(SecurityAlert alert) {
        return "[SECURITY ALERT]\n"
                + "Severity: " + alert.getSeverity() + "\n"
                + "Type: " + alert.getAlertType() + "\n"
                + "UserId: " + (alert.getUserIdRef() == null ? "-" : alert.getUserIdRef()) + "\n"
                + "IP: " + (alert.getIpAddress() == null ? "-" : alert.getIpAddress()) + "\n"
                + "Action: " + (alert.getActionName() == null ? "-" : alert.getActionName()) + "\n"
                + "Changed: " + (alert.getChangedValues() == null ? "{}" : alert.getChangedValues()) + "\n"
                + "Message: " + alert.getMessage();
    }

    private String toJson(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toUpperCase();
    }
}
