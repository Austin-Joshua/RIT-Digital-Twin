package com.university.erp.security.defense;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Security telemetry without PII. Logs anomaly events, risk changes,
 * mitigation actions. No usernames, IPs in plaintext; hashed client key for correlation.
 */
@Slf4j
@Service
public class SecurityTelemetryService {

    private static final String DEFENSE = "ADAPTIVE_DEFENSE";

    public void logAnomaly(String clientKeyHash, String anomalyType, int severity) {
        log.info("{} anomaly client={} type={} severity={}", DEFENSE, mask(clientKeyHash), anomalyType, severity);
    }

    public void logRiskChange(String clientKeyHash, int previousScore, int newScore, RiskLevel level) {
        log.info("{} risk_change client={} score={}->{} level={}", DEFENSE, mask(clientKeyHash), previousScore, newScore, level);
    }

    public void logMitigation(String action, String clientKey, String reason) {
        log.info("{} mitigation action={} client={}", DEFENSE, action, hashForLog(clientKey));
    }

    public void logCritical(String event, String clientKeyHash) {
        log.warn("{} critical event={} client={}", DEFENSE, event, mask(clientKeyHash));
    }

    /** Hash for storage/correlation; do not log raw IP or userId. */
    public static String hashForLog(String clientKey) {
        if (clientKey == null || clientKey.isEmpty()) return "anon";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(clientKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            return "na";
        }
    }

    private static String mask(String s) {
        if (s == null || s.length() < 8) return "***";
        return s.substring(0, 4) + "***";
    }
}
