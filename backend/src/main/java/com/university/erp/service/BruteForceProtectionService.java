package com.university.erp.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class BruteForceProtectionService {
    private static final int MAX_ATTEMPT = 5;
    private static final int BLOCK_DURATION_MINUTES = 15;
    private final Cache<String, Integer> attemptsCache;

    public BruteForceProtectionService() {
        attemptsCache = Caffeine.newBuilder()
                .expireAfterWrite(BLOCK_DURATION_MINUTES, TimeUnit.MINUTES)
                .build();
    }

    public void loginSucceeded(String key) {
        attemptsCache.invalidate(key);
    }

    public void loginFailed(String key) {
        int attempts = getAttempts(key);
        attempts++;
        attemptsCache.put(key, attempts);
    }

    public boolean isBlocked(String key) {
        return getAttempts(key) >= MAX_ATTEMPT;
    }

    /** Unblock a specific username/email (e.g. after fixing credentials). */
    public void unblock(String key) {
        attemptsCache.invalidate(key);
    }

    /** Clear all login attempt counters (e.g. admin use or after seeding users). */
    public void clearAll() {
        attemptsCache.invalidateAll();
    }

    private int getAttempts(String key) {
        Integer attempts = attemptsCache.getIfPresent(key);
        return attempts == null ? 0 : attempts;
    }
}
