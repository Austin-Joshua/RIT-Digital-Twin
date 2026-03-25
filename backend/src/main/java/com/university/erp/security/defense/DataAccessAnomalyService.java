package com.university.erp.security.defense;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.TimeUnit;

/**
 * Detects large-scale data retrieval, enumeration behavior, repeated
 * access to unrelated records, abnormal query patterns.
 */
@Slf4j
@Service
public class DataAccessAnomalyService {

    private static final Set<String> LIST_PATH_PREFIXES = Set.of(
            "/api/academic/", "/api/marks/", "/api/transport/", "/api/assets/",
            "/api/alumni/", "/api/hod/", "/api/faculty/", "/api/ai/"
    );

    private final AdaptiveDefenseProperties props;
    private final Cache<String, ListAccessWindow> listAccessCache = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .maximumSize(50_000)
            .build();

    public DataAccessAnomalyService(AdaptiveDefenseProperties props) {
        this.props = props;
    }

    public boolean isListPath(String path) {
        if (path == null) return false;
        String p = path.split("\\?")[0];
        return LIST_PATH_PREFIXES.stream().anyMatch(p::startsWith);
    }

    public boolean checkListBurst(ClientContext ctx) {
        if (!isListPath(ctx.getPath())) return false;

        String key = ctx.getClientKey();
        ListAccessWindow window = listAccessCache.get(key, k -> new ListAccessWindow(props.getDataAccess().getListBurstWindowSeconds()));
        if (window == null) return false;

        int count = window.recordAndCount(ctx.getTimestampMs());
        return count > props.getDataAccess().getListRequestBurstThreshold();
    }

    private static class ListAccessWindow {
        private final long windowMs;
        private final ConcurrentLinkedDeque<Long> timestamps = new ConcurrentLinkedDeque<>();

        ListAccessWindow(int windowSeconds) {
            this.windowMs = windowSeconds * 1000L;
        }

        int recordAndCount(long now) {
            timestamps.add(now);
            long cutoff = now - windowMs;
            while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
                timestamps.pollFirst();
            }
            return timestamps.size();
        }
    }
}
