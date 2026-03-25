package com.university.erp.security.defense;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;

/**
 * Establishes and updates normal usage patterns per client (request rate,
 * navigation path sequence, activity windows). Used for anomaly detection.
 */
@Slf4j
@Service
public class BehavioralBaselineService {

    private static final int MAX_PATH_HISTORY = 32;
    private static final long WINDOW_MS = 60_000;

    private final AdaptiveDefenseProperties props;
    private final Cache<String, ClientBaseline> baselineCache;

    public BehavioralBaselineService(AdaptiveDefenseProperties props) {
        this.props = props;
        this.baselineCache = Caffeine.newBuilder()
                .expireAfterAccess(props.getBaselineWindowMinutes() * 2L, TimeUnit.MINUTES)
                .maximumSize(50_000)
                .build();
    }

    public void recordRequest(ClientContext ctx) {
        String key = ctx.getClientKey();
        ClientBaseline base = baselineCache.get(key, k -> new ClientBaseline());
        if (base == null) return;
        base.record(ctx);
    }

    public BaselineSnapshot getBaseline(String clientKey) {
        ClientBaseline base = baselineCache.getIfPresent(clientKey);
        if (base == null) return null;
        return base.snapshot();
    }

    public boolean hasEnoughSamples(String clientKey) {
        BaselineSnapshot s = getBaseline(clientKey);
        return s != null && s.getSampleCount() >= props.getBaselineMinSamples();
    }

    @SuppressWarnings("unused")
    public void evict(String clientKey) {
        baselineCache.invalidate(clientKey);
    }

    public static class ClientBaseline {
        private final LongAdder requestCount = new LongAdder();
        private final ConcurrentLinkedDeque<Long> requestTimestamps = new ConcurrentLinkedDeque<>();
        private final ConcurrentLinkedDeque<String> pathHistory = new ConcurrentLinkedDeque<>();
        private final AtomicInteger sampleCount = new AtomicInteger(0);
        private static final long WINDOW_MS = 60_000;

        void record(ClientContext ctx) {
            long now = ctx.getTimestampMs();
            requestCount.increment();
            requestTimestamps.add(now);
            sampleCount.incrementAndGet();
            pathHistory.add(normalizePath(ctx.getPath()));
            prune(now);
        }

        private void prune(long now) {
            while (!requestTimestamps.isEmpty() && now - requestTimestamps.peekFirst() > WINDOW_MS) {
                requestTimestamps.pollFirst();
            }
            while (pathHistory.size() > MAX_PATH_HISTORY) {
                pathHistory.pollFirst();
            }
        }

        BaselineSnapshot snapshot() {
            long now = System.currentTimeMillis();
            prune(now);
            int inWindow = requestTimestamps.size();
            return BaselineSnapshot.builder()
                    .requestsPerMinute(inWindow)
                    .pathHistory(pathHistory.stream().toList())
                    .sampleCount(sampleCount.get())
                    .build();
        }
    }

    private static String normalizePath(String path) {
        if (path == null) return "";
        int q = path.indexOf('?');
        return q >= 0 ? path.substring(0, q) : path;
    }

    @lombok.Value
    @lombok.Builder
    public static class BaselineSnapshot {
        int requestsPerMinute;
        java.util.List<String> pathHistory;
        int sampleCount;
    }
}
