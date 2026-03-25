package com.university.erp.security.defense;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.TimeUnit;

/**
 * Per-client rate limits that adapt to risk level. Normal limits for trusted
 * behavior; stricter limits and cooldowns for high-risk clients.
 */
@Slf4j
@Service
public class AdaptiveRateController {

    private final AdaptiveDefenseProperties props;
    private final Cache<String, SlidingWindow> requestWindows;
    private final Cache<String, Long> cooldownUntil;

    public AdaptiveRateController(AdaptiveDefenseProperties props) {
        this.props = props;
        this.requestWindows = Caffeine.newBuilder()
                .expireAfterAccess(5, TimeUnit.MINUTES)
                .maximumSize(100_000)
                .build();
        this.cooldownUntil = Caffeine.newBuilder()
                .expireAfterWrite(60, TimeUnit.MINUTES)
                .maximumSize(50_000)
                .build();
    }

    public RateLimitResult checkAndIncrement(String clientKey, RiskLevel riskLevel) {
        long now = System.currentTimeMillis();

        Long cooldown = cooldownUntil.getIfPresent(clientKey);
        if (cooldown != null && now < cooldown) {
            return RateLimitResult.builder().allowed(false).retryAfterSeconds((int) ((cooldown - now) / 1000)).build();
        }

        int limit = getLimitForRisk(riskLevel);
        SlidingWindow window = requestWindows.get(clientKey, k -> new SlidingWindow(props.getRateLimit().getWindowSeconds()));
        if (window == null) return RateLimitResult.builder().allowed(true).build();

        int currentBefore = window.count(now);
        if (currentBefore >= limit) {
            return RateLimitResult.builder().allowed(false).retryAfterSeconds(props.getRateLimit().getWindowSeconds()).build();
        }
        int currentAfter = window.addAndCount(now);
        return RateLimitResult.builder().allowed(true).currentCount(currentAfter).limit(limit).build();
    }

    public void applyCooldown(String clientKey, RiskLevel riskLevel) {
        int minutes = riskLevel == RiskLevel.CRITICAL ? props.getCooldown().getCriticalMinutes() : props.getCooldown().getHighRiskMinutes();
        cooldownUntil.put(clientKey, System.currentTimeMillis() + minutes * 60_000L);
    }

    private int getLimitForRisk(RiskLevel level) {
        return switch (level) {
            case CRITICAL -> props.getRateLimit().getCriticalRequestsPerMinute();
            case HIGH -> props.getRateLimit().getHighRequestsPerMinute();
            case MEDIUM -> props.getRateLimit().getElevatedRequestsPerMinute();
            default -> props.getRateLimit().getNormalRequestsPerMinute();
        };
    }

    private static class SlidingWindow {
        private final long windowMs;
        private final ConcurrentLinkedDeque<Long> timestamps = new ConcurrentLinkedDeque<>();

        SlidingWindow(int windowSeconds) {
            this.windowMs = windowSeconds * 1000L;
        }

        int count(long now) {
            long cutoff = now - windowMs;
            return (int) timestamps.stream().filter(t -> t >= cutoff).count();
        }

        int addAndCount(long now) {
            timestamps.add(now);
            long cutoff = now - windowMs;
            while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
                timestamps.pollFirst();
            }
            while (timestamps.size() > 1000) {
                timestamps.pollFirst();
            }
            return timestamps.size();
        }
    }

    @lombok.Value
    @lombok.Builder
    public static class RateLimitResult {
        boolean allowed;
        int retryAfterSeconds;
        int currentCount;
        int limit;
    }
}
