package com.university.erp.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.university.erp.model.AccessActivityLog;
import com.university.erp.model.User;
import com.university.erp.repository.AccessActivityLogRepository;
import com.university.erp.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class RequestSecurityMonitoringService {

    private static final int HIGH_FREQ_THRESHOLD_PER_MINUTE = 180;
    private static final int UNKNOWN_ACCESS_THRESHOLD_PER_MINUTE = 20;

    private final AccessActivityLogRepository accessActivityLogRepository;
    private final UserRepository userRepository;
    private final SecurityAlertService alertService;

    private final Cache<String, AtomicInteger> requestCounter = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(200_000)
            .build();
    private final Cache<String, AtomicInteger> deniedCounter = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(200_000)
            .build();
    private final Cache<Long, String> recentUserLocation = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(12))
            .maximumSize(50_000)
            .build();

    public RequestSecurityMonitoringService(
            AccessActivityLogRepository accessActivityLogRepository,
            UserRepository userRepository,
            SecurityAlertService alertService
    ) {
        this.accessActivityLogRepository = accessActivityLogRepository;
        this.userRepository = userRepository;
        this.alertService = alertService;
    }

    public void recordRequest(HttpServletRequest request, int status, Long userId, String username) {
        String ip = clientIp(request);
        String location = location(request);
        String sessionId = sessionId(request);
        String userAgent = userAgent(request);
        boolean maskedIpSuspected = hasProxyMaskingSignals(request);

        String counterKey = ip + "|" + (userId == null ? "anonymous" : userId);
        int requestRate = requestCounter.get(counterKey, key -> new AtomicInteger(0)).incrementAndGet();
        String riskLevel = requestRate > HIGH_FREQ_THRESHOLD_PER_MINUTE ? "HIGH" : "LOW";
        if (maskedIpSuspected && "LOW".equals(riskLevel)) {
            riskLevel = "MEDIUM";
        }

        User user = userId == null ? null : userRepository.findById(userId).orElse(null);
        AccessActivityLog activity = AccessActivityLog.builder()
                .user(user)
                .userIdRef(userId)
                .username(username)
                .ipAddress(ip)
                .deviceInfo(userAgent)
                .sessionId(sessionId)
                .location(location)
                .requestPath(request.getRequestURI())
                .requestMethod(request.getMethod())
                .responseStatus(status)
                .requestPattern(patternFor(request))
                .riskLevel(riskLevel)
                .maskedIpSuspected(maskedIpSuspected)
                .build();
        accessActivityLogRepository.save(activity);

        if (maskedIpSuspected) {
            alertService.raiseAlert(
                    "HIGH",
                    "MASKED_IP_USAGE",
                    userId,
                    ip,
                    request.getMethod() + " " + request.getRequestURI(),
                    Map.of("location", location, "sessionId", sessionId),
                    "Potential VPN or proxy-masked IP access detected."
            );
        }

        if (requestRate > HIGH_FREQ_THRESHOLD_PER_MINUTE) {
            alertService.raiseAlert(
                    "HIGH",
                    "ABNORMAL_REQUEST_FREQUENCY",
                    userId,
                    ip,
                    request.getMethod() + " " + request.getRequestURI(),
                    Map.of("requestsPerMinute", requestRate),
                    "Abnormal request frequency detected for the session."
            );
        }

        if ((status == 401 || status == 403)) {
            int deniedCount = deniedCounter.get(ip, key -> new AtomicInteger(0)).incrementAndGet();
            if (deniedCount >= UNKNOWN_ACCESS_THRESHOLD_PER_MINUTE) {
                alertService.raiseAlert(
                        "CRITICAL",
                        "UNKNOWN_ACCESS_ATTEMPTS",
                        userId,
                        ip,
                        request.getMethod() + " " + request.getRequestURI(),
                        Map.of("deniedCount", deniedCount),
                        "Repeated unknown or unauthorized access attempts detected."
                );
            }
        }

        if (userId != null) {
            detectLocationAnomaly(userId, ip, location, request.getRequestURI());
        }
    }

    public void trackSuccessfulLogin(Long userId, String username, String ip, String location, String device) {
        detectLocationAnomaly(userId, ip, location, "/api/auth/login");
        if (device != null && device.toLowerCase().contains("curl")) {
            alertService.raiseAlert(
                    "MEDIUM",
                    "SUSPICIOUS_DEVICE_LOGIN",
                    userId,
                    ip,
                    "LOGIN",
                    Map.of("device", device, "location", location),
                    "Login detected from atypical scripted client device."
            );
        }
        log.info("Security tracker login success user={} ip={} location={}", username, ip, location);
    }

    private void detectLocationAnomaly(Long userId, String ip, String location, String action) {
        if (location == null || location.isBlank() || "UNKNOWN".equalsIgnoreCase(location)) return;
        String previous = recentUserLocation.getIfPresent(userId);
        if (previous != null && !previous.equalsIgnoreCase(location)) {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("previousLocation", previous);
            details.put("currentLocation", location);
            details.put("action", action);
            details.put("detectedAt", LocalDateTime.now().toString());
            alertService.raiseAlert(
                    "HIGH",
                    "MULTI_LOCATION_ACCESS",
                    userId,
                    ip,
                    action,
                    details,
                    "Multiple session locations detected for a single user in a short window."
            );
        }
        recentUserLocation.put(userId, location);
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) return realIp.trim();
        return Optional.ofNullable(request.getRemoteAddr()).orElse("0.0.0.0");
    }

    private String location(HttpServletRequest request) {
        String cf = request.getHeader("CF-IPCountry");
        if (cf != null && !cf.isBlank()) return cf.trim();
        String x = request.getHeader("X-Country-Code");
        if (x != null && !x.isBlank()) return x.trim();
        return "UNKNOWN";
    }

    private String sessionId(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && !authorization.isBlank()) {
            return Integer.toHexString(authorization.hashCode());
        }
        return Optional.ofNullable(request.getRequestedSessionId()).orElse("no-session");
    }

    private String userAgent(HttpServletRequest request) {
        return Optional.ofNullable(request.getHeader("User-Agent")).orElse("unknown");
    }

    private String patternFor(HttpServletRequest request) {
        String path = Optional.ofNullable(request.getRequestURI()).orElse("/");
        if (path.startsWith("/api/auth/")) return "AUTH";
        if (path.contains("/timetable")) return "TIMETABLE";
        if (path.contains("/students")) return "STUDENT_DATA";
        return "GENERAL";
    }

    private boolean hasProxyMaskingSignals(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        String via = request.getHeader("Via");
        String forwarded = request.getHeader("Forwarded");
        String proxyConnection = request.getHeader("Proxy-Connection");
        return (xff != null && xff.contains(","))
                || (via != null && !via.isBlank())
                || (forwarded != null && !forwarded.isBlank())
                || (proxyConnection != null && !proxyConnection.isBlank());
    }
}
