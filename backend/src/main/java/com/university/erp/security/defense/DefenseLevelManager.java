package com.university.erp.security.defense;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.LongAdder;

/**
 * Self-adjusting global defense level. Increases when attack indicators rise
 * or traffic becomes suspicious; relaxes when behavior normalizes.
 */
@Slf4j
@Service
public class DefenseLevelManager {

    private final LongAdder recentAnomalyCount = new LongAdder();
    private final LongAdder recentBlockCount = new LongAdder();
    private volatile long lastAnomalyResetMs = System.currentTimeMillis();
    private static final long RESET_WINDOW_MS = 120_000;

    public DefenseLevelManager() {
        // Default constructor
    }

    public void recordAnomaly() {
        recentAnomalyCount.increment();
    }

    public void recordBlock() {
        recentBlockCount.increment();
    }

    public DefenseLevel getCurrentLevel() {
        resetIfNeeded();
        int anomalies = recentAnomalyCount.intValue();
        int blocks = recentBlockCount.intValue();
        if (anomalies > 50 || blocks > 20) return DefenseLevel.CRITICAL;
        if (anomalies > 20 || blocks > 8) return DefenseLevel.HIGH;
        if (anomalies > 8 || blocks > 3) return DefenseLevel.ELEVATED;
        return DefenseLevel.NORMAL;
    }

    private void resetIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - lastAnomalyResetMs > RESET_WINDOW_MS) {
            lastAnomalyResetMs = now;
            recentAnomalyCount.reset();
            recentBlockCount.reset();
        }
    }

    public enum DefenseLevel {
        NORMAL,
        ELEVATED,
        HIGH,
        CRITICAL
    }
}
