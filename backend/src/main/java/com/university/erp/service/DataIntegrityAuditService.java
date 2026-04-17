package com.university.erp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.university.erp.model.DataChangeAuditLog;
import com.university.erp.model.User;
import com.university.erp.repository.DataChangeAuditLogRepository;
import com.university.erp.security.defense.SecurityTelemetryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class DataIntegrityAuditService {

    private static final String STAGE_BEFORE = "BEFORE";
    private static final String STAGE_DURING = "DURING";
    private static final String STAGE_AFTER = "AFTER";

    private final DataChangeAuditLogRepository auditRepository;
    private final ObjectMapper objectMapper;
    private final SecurityAlertService securityAlertService;

    public DataIntegrityAuditService(
            DataChangeAuditLogRepository auditRepository,
            ObjectMapper objectMapper,
            SecurityAlertService securityAlertService
    ) {
        this.auditRepository = auditRepository;
        this.objectMapper = objectMapper.copy().configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
        this.securityAlertService = securityAlertService;
    }

    public UpdateAuditContext beginTrackedUpdate(
            String entityType,
            String entityId,
            String action,
            Map<String, Object> beforeState
    ) {
        RequestMeta meta = requestMeta();
        User actor = currentUserOrNull();
        Long actorId = actor == null ? null : actor.getUserId();
        String beforeJson = toJson(beforeState);
        String beforeChecksum = sha256(beforeJson);

        boolean tamperingDetected = auditRepository
                .findTopByEntityTypeAndEntityIdAndStageOrderByCreatedAtDesc(entityType, entityId, STAGE_AFTER)
                .map(DataChangeAuditLog::getChecksumAfter)
                .filter(previousChecksum -> previousChecksum != null && !previousChecksum.equals(beforeChecksum))
                .isPresent();

        DataChangeAuditLog beforeLog = DataChangeAuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .stage(STAGE_BEFORE)
                .action(action)
                .actor(actor)
                .actorUserId(actorId)
                .ipAddress(meta.ipAddress)
                .deviceInfo(meta.deviceInfo)
                .sessionId(meta.sessionId)
                .location(meta.location)
                .oldValue(beforeJson)
                .checksumBefore(beforeChecksum)
                .tamperingDetected(tamperingDetected)
                .build();
        auditRepository.save(beforeLog);

        DataChangeAuditLog duringLog = DataChangeAuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .stage(STAGE_DURING)
                .action(action)
                .actor(actor)
                .actorUserId(actorId)
                .ipAddress(meta.ipAddress)
                .deviceInfo(meta.deviceInfo)
                .sessionId(meta.sessionId)
                .location(meta.location)
                .oldValue(beforeJson)
                .checksumBefore(beforeChecksum)
                .tamperingDetected(tamperingDetected)
                .build();
        auditRepository.save(duringLog);

        if (tamperingDetected) {
            Map<String, Object> changed = new LinkedHashMap<>();
            changed.put("entityType", entityType);
            changed.put("entityId", entityId);
            changed.put("checksumNow", beforeChecksum);
            securityAlertService.raiseAlert(
                    "CRITICAL",
                    "DATA_TAMPERING",
                    actorId,
                    meta.ipAddress,
                    action,
                    changed,
                    "Integrity mismatch detected before update. Potential unauthorized DB tampering."
            );
        }
        return new UpdateAuditContext(entityType, entityId, action, beforeState, beforeChecksum, tamperingDetected, meta, actor, actorId);
    }

    public void completeTrackedUpdate(UpdateAuditContext context, Map<String, Object> afterState) {
        String afterJson = toJson(afterState);
        String afterChecksum = sha256(afterJson);
        String changedFields = toJson(diff(context.beforeState, afterState));

        DataChangeAuditLog afterLog = DataChangeAuditLog.builder()
                .entityType(context.entityType)
                .entityId(context.entityId)
                .stage(STAGE_AFTER)
                .action(context.action)
                .actor(context.actor)
                .actorUserId(context.actorId)
                .ipAddress(context.requestMeta.ipAddress)
                .deviceInfo(context.requestMeta.deviceInfo)
                .sessionId(context.requestMeta.sessionId)
                .location(context.requestMeta.location)
                .oldValue(toJson(context.beforeState))
                .newValue(afterJson)
                .changedFields(changedFields)
                .checksumBefore(context.beforeChecksum)
                .checksumAfter(afterChecksum)
                .tamperingDetected(context.tamperingDetected)
                .build();
        auditRepository.save(afterLog);
    }

    public Optional<Map<String, Object>> latestBeforeSnapshot(String entityType, String entityId) {
        return auditRepository.findTopByEntityTypeAndEntityIdAndStageOrderByCreatedAtDesc(entityType, entityId, STAGE_BEFORE)
                .map(DataChangeAuditLog::getOldValue)
                .flatMap(this::fromJsonMap);
    }

    private Optional<Map<String, Object>> fromJsonMap(String json) {
        if (json == null || json.isBlank()) return Optional.empty();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            return Optional.of(map);
        } catch (Exception ex) {
            log.warn("Unable to parse snapshot JSON for rollback: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private String toJson(Map<String, Object> value) {
        if (value == null || value.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private Map<String, Object> diff(Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changes = new LinkedHashMap<>();
        Set<String> keys = new TreeSet<>();
        if (before != null) keys.addAll(before.keySet());
        if (after != null) keys.addAll(after.keySet());
        for (String key : keys) {
            Object oldValue = before == null ? null : before.get(key);
            Object newValue = after == null ? null : after.get(key);
            if (!Objects.equals(String.valueOf(oldValue), String.valueOf(newValue))) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("old", oldValue);
                entry.put("new", newValue);
                changes.put(key, entry);
            }
        }
        return changes;
    }

    private RequestMeta requestMeta() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes == null ? null : attributes.getRequest();
        if (request == null) {
            return new RequestMeta("0.0.0.0", "unknown", "none", "UNKNOWN", LocalDateTime.now());
        }
        String xff = request.getHeader("X-Forwarded-For");
        String ip = (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
        String ua = request.getHeader("User-Agent");
        String token = request.getHeader("Authorization");
        String sessionId = token == null ? request.getRequestedSessionId() : SecurityTelemetryService.hashForLog(token);
        String location = Optional.ofNullable(request.getHeader("CF-IPCountry"))
                .orElse(Optional.ofNullable(request.getHeader("X-Country-Code")).orElse("UNKNOWN"));
        return new RequestMeta(ip == null ? "0.0.0.0" : ip, ua == null ? "unknown" : ua, sessionId == null ? "none" : sessionId, location, LocalDateTime.now());
    }

    private User currentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;
        if (authentication.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }

    private String sha256(String payload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((payload == null ? "" : payload).getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte b : hash) builder.append(String.format("%02x", b));
            return builder.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    @Getter
    public static class UpdateAuditContext {
        private final String entityType;
        private final String entityId;
        private final String action;
        private final Map<String, Object> beforeState;
        private final String beforeChecksum;
        private final boolean tamperingDetected;
        private final RequestMeta requestMeta;
        private final User actor;
        private final Long actorId;

        public UpdateAuditContext(String entityType, String entityId, String action, Map<String, Object> beforeState,
                                  String beforeChecksum, boolean tamperingDetected, RequestMeta requestMeta, User actor, Long actorId) {
            this.entityType = entityType;
            this.entityId = entityId;
            this.action = action;
            this.beforeState = beforeState;
            this.beforeChecksum = beforeChecksum;
            this.tamperingDetected = tamperingDetected;
            this.requestMeta = requestMeta;
            this.actor = actor;
            this.actorId = actorId;
        }
    }

    private record RequestMeta(String ipAddress, String deviceInfo, String sessionId, String location, LocalDateTime timestamp) {
    }
}
