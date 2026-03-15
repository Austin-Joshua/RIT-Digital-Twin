package com.university.erp.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class BruteForceProtectionService {
    private static final int MAX_ATTEMPT = 5;
    private static final int MAX_ATTEMPT_PER_IP = 10;
    private static final int BLOCK_DURATION_MINUTES = 15;
    private final Cache<String, Integer> attemptsCache;
    private final Cache<String, Integer> attemptsByIpCache;

    public BruteForceProtectionService() {
        attemptsCache = Caffeine.newBuilder()
                .expireAfterWrite(BLOCK_DURATION_MINUTES, TimeUnit.MINUTES)
                .maximumSize(50_000)
                .build();
        attemptsByIpCache = Caffeine.newBuilder()
                .expireAfterWrite(BLOCK_DURATION_MINUTES, TimeUnit.MINUTES)
                .maximumSize(100_000)
                .build();
    }

    public void loginSucceeded(String key) {
        attemptsCache.invalidate(key);
    }

    public void loginSucceededByIp(String ip) {
        if (ip != null && !ip.isBlank()) {
            attemptsByIpCache.invalidate(ip.trim());
        }
    }

    public void loginFailed(String key) {
        int attempts = getAttempts(key);
        attempts++;
        attemptsCache.put(key, attempts);
    }

    public void loginFailedByIp(String ip) {
        if (ip == null || ip.isBlank()) return;
        String k = ip.trim();
        int attempts = getAttemptsByIp(k);
        attemptsByIpCache.put(k, attempts + 1);
    }

    public boolean isBlocked(String key) {
        return getAttempts(key) >= MAX_ATTEMPT;
    }

    public boolean isBlockedByIp(String ip) {
        return ip != null && !ip.isBlank() && getAttemptsByIp(ip.trim()) >= MAX_ATTEMPT_PER_IP;
    }

    /** Unblock a specific username/email (e.g. after fixing credentials). */
    public void unblock(String key) {
        attemptsCache.invalidate(key);
    }

    /** Unblock an IP (e.g. admin use). */
    public void unblockIp(String ip) {
        if (ip != null && !ip.isBlank()) {
            attemptsByIpCache.invalidate(ip.trim());
        }
    }

    /** Clear all login attempt counters (e.g. admin use or after seeding users). */
    public void clearAll() {
        attemptsCache.invalidateAll();
        attemptsByIpCache.invalidateAll();
    }

    private int getAttempts(String key) {
        Integer attempts = attemptsCache.getIfPresent(key);
        return attempts == null ? 0 : attempts;
    }

    private int getAttemptsByIp(String ip) {
        Integer attempts = attemptsByIpCache.getIfPresent(ip);
        return attempts == null ? 0 : attempts;
    }
}
