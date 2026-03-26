package com.university.erp.security.defense;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Monitors role-based behavior: unusual admin actions, abnormal access
 * within a role, privilege boundary probing, suspicious bulk operations.
 */
@Slf4j
@Service
public class PrivilegeMisuseDetector {

    private static final Set<String> SENSITIVE_ADMIN_PATHS = Set.of(
            "/api/auth/unblock", "/api/auth/change-password",
            "/api/hod/", "/api/marks/", "/api/academic/", "/api/assets/", "/api/alumni/"
    );
    private static final Set<String> BULK_INDICATORS = Set.of("bulk", "upload", "export", "all");

    private final Cache<String, RolePathHistory> rolePathCache = Caffeine.newBuilder()
            .expireAfterAccess(60, TimeUnit.MINUTES)
            .maximumSize(20_000)
            .build();

    public PrivilegeCheckResult check(ClientContext ctx) {
        if (ctx.getRole() == null || ctx.getUserId() == null) return PrivilegeCheckResult.ok();

        String key = ctx.getClientKey();
        String path = normalizePath(ctx.getPath());
        String role = ctx.getRole();

        RolePathHistory history = rolePathCache.get(key, k -> new RolePathHistory());
        if (history == null) return PrivilegeCheckResult.ok();

        history.record(path, ctx.getTimestampMs());

        boolean unusualAdmin = "ADMIN".equals(role) && SENSITIVE_ADMIN_PATHS.stream().anyMatch(path::startsWith)
                && history.getAccessCount(path) == 1 && history.getTotalPaths() > 10;
        boolean bulkLike = BULK_INDICATORS.stream().anyMatch(s -> path.toLowerCase().contains(s))
                && history.getRecentRequestCount(ctx.getTimestampMs(), 60_000) > 5;

        if (unusualAdmin) {
            return PrivilegeCheckResult.anomaly("unusual_admin_action");
        }
        if (bulkLike) {
            return PrivilegeCheckResult.anomaly("suspicious_bulk");
        }
        return PrivilegeCheckResult.ok();
    }

    private static String normalizePath(String path) {
        if (path == null) return "";
        int q = path.indexOf('?');
        return q >= 0 ? path.substring(0, q) : path;
    }

    private static class RolePathHistory {
        private final ConcurrentHashMap<String, Integer> pathCounts = new ConcurrentHashMap<>();
        private final java.util.concurrent.ConcurrentLinkedDeque<Long> recentTimestamps = new java.util.concurrent.ConcurrentLinkedDeque<>();

        void record(String path, long ts) {
            pathCounts.put(path, pathCounts.getOrDefault(path, 0) + 1);
            recentTimestamps.add(ts);
            while (recentTimestamps.size() > 200) recentTimestamps.pollFirst();
        }

        int getAccessCount(String path) {
            return pathCounts.getOrDefault(path, 0);
        }

        int getTotalPaths() {
            return pathCounts.size();
        }

        int getRecentRequestCount(long now, long windowMs) {
            long cutoff = now - windowMs;
            return (int) recentTimestamps.stream().filter(t -> t >= cutoff).count();
        }
    }

    @lombok.Value
    @lombok.Builder
    public static class PrivilegeCheckResult {
        boolean ok;
        String anomalyType;

        static PrivilegeCheckResult ok() {
            return PrivilegeCheckResult.builder().ok(true).build();
        }

        static PrivilegeCheckResult anomaly(String type) {
            return PrivilegeCheckResult.builder().ok(false).anomalyType(type).build();
        }
    }
}
