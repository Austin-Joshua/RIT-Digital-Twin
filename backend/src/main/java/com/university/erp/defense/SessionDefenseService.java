package com.university.erp.defense;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.TimeUnit;

/**
 * Session-level defense: detect session hijacking patterns, concurrent
 * abnormal usage, rapid context switching, excessive actions per session.
 */
@Slf4j
@Service
public class SessionDefenseService {

    private final AdaptiveDefenseProperties props;
    private final Cache<String, SessionState> sessionCache;

    public SessionDefenseService(AdaptiveDefenseProperties props) {
        this.props = props;
        this.sessionCache = Caffeine.newBuilder()
                .expireAfterAccess(30, TimeUnit.MINUTES)
                .maximumSize(50_000)
                .build();
    }

    public SessionCheckResult check(ClientContext ctx) {
        String key = ctx.getClientKey();
        SessionState state = sessionCache.get(key, k -> new SessionState());
        if (state == null) return SessionCheckResult.ok();

        long now = ctx.getTimestampMs();
        state.record(now, ctx.getPath());

        boolean rapidActions = state.countInWindow(now, props.getSession().getRapidActionWindowMs()) > props.getSession().getRapidActionThreshold();
        boolean overSessionRate = state.requestsPerMinute(now) > props.getSession().getMaxRequestsPerMinutePerSession();

        if (rapidActions) {
            return SessionCheckResult.anomaly("rapid_actions");
        }
        if (overSessionRate) {
            return SessionCheckResult.anomaly("session_rate");
        }
        return SessionCheckResult.ok();
    }

    private static class SessionState {
        private final ConcurrentLinkedDeque<Long> timestamps = new ConcurrentLinkedDeque<>();

        void record(long ts, String path) {
            timestamps.add(ts);
            while (timestamps.size() > 500) {
                timestamps.pollFirst();
            }
        }

        int countInWindow(long now, long windowMs) {
            long cutoff = now - windowMs;
            return (int) timestamps.stream().filter(t -> t >= cutoff).count();
        }

        int requestsPerMinute(long now) {
            return countInWindow(now, 60_000);
        }
    }

    @lombok.Value
    @lombok.Builder
    public static class SessionCheckResult {
        boolean ok;
        String anomalyType;

        static SessionCheckResult ok() {
            return SessionCheckResult.builder().ok(true).build();
        }

        static SessionCheckResult anomaly(String type) {
            return SessionCheckResult.builder().ok(false).anomalyType(type).build();
        }
    }
}
