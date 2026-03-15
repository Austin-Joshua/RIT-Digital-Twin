package com.university.erp.defense;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Dynamic risk score per client. Factors: request frequency, failed auth,
 * anomaly signals, restricted access attempts. Decay over time to avoid
 * permanent penalty for legitimate users.
 */
@Slf4j
@Service
public class RiskScoringService {

    private final AdaptiveDefenseProperties props;
    private final Cache<String, RiskState> riskCache;

    public RiskScoringService(AdaptiveDefenseProperties props) {
        this.props = props;
        this.riskCache = Caffeine.newBuilder()
                .expireAfterAccess(60, TimeUnit.MINUTES)
                .maximumSize(100_000)
                .build();
    }

    public int getScore(String clientKey) {
        RiskState state = riskCache.getIfPresent(clientKey);
        if (state == null) return 0;
        state.decayIfNeeded();
        return state.score.get();
    }

    public RiskLevel getLevel(String clientKey) {
        int score = getScore(clientKey);
        if (score >= props.getRisk().getCriticalThreshold()) return RiskLevel.CRITICAL;
        if (score >= props.getRisk().getHighThreshold()) return RiskLevel.HIGH;
        if (score >= props.getRisk().getMediumThreshold()) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    public void addRisk(String clientKey, int delta, String reason) {
        RiskState state = riskCache.get(clientKey, k -> new RiskState());
        if (state == null) return;
        state.add(delta, reason);
    }

    public void recordFailedAuth(String clientKey) {
        addRisk(clientKey, 15, "failed_auth");
    }

    public void recordAnomaly(String clientKey, int severity) {
        addRisk(clientKey, 5 + severity * 3, "anomaly");
    }

    public void recordRestrictedAccessAttempt(String clientKey) {
        addRisk(clientKey, 20, "restricted_access");
    }

    public void recordDataBurst(String clientKey) {
        addRisk(clientKey, 10, "data_burst");
    }

    public void recordRapidActions(String clientKey) {
        addRisk(clientKey, 8, "rapid_actions");
    }

    /** Normal successful behavior: slight decay. */
    public void recordNormalBehavior(String clientKey) {
        RiskState state = riskCache.getIfPresent(clientKey);
        if (state != null) {
            state.decayIfNeeded();
            state.decay(props.getRisk().getDecayPerMinute() / 2);
        }
    }

    private class RiskState {
        private final AtomicInteger score = new AtomicInteger(0);
        private volatile long lastDecayMs = System.currentTimeMillis();

        void add(int delta, String reason) {
            score.updateAndGet(s -> Math.min(100, s + delta));
        }

        void decay(int amount) {
            score.updateAndGet(s -> Math.max(0, s - amount));
        }

        void decayIfNeeded() {
            long now = System.currentTimeMillis();
            long elapsed = (now - lastDecayMs) / 60_000;
            if (elapsed > 0) {
                lastDecayMs = now;
                decay((int) (elapsed * props.getRisk().getDecayPerMinute()));
            }
        }
    }
}
