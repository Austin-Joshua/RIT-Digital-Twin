package com.university.erp.defense;

import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Critical vs non-critical paths. Under stress, apply stricter limits to
 * non-critical first so auth and core dashboards remain available.
 */
@Service
public class ResourcePrioritization {

    private static final Set<String> CRITICAL_PREFIXES = Set.of(
            "/api/auth/login",
            "/api/auth/refresh-token",
            "/api/auth/me",
            "/api/auth/google",
            "/actuator/health"
    );

    private static final Set<String> CORE_PREFIXES = Set.of(
            "/api/auth/",
            "/api/academic/",
            "/api/hod/",
            "/api/transport/"
    );

    public boolean isCritical(String path) {
        if (path == null) return false;
        String p = path.split("\\?")[0];
        return CRITICAL_PREFIXES.stream().anyMatch(p::startsWith);
    }

    public boolean isCore(String path) {
        if (path == null) return false;
        String p = path.split("\\?")[0];
        return CORE_PREFIXES.stream().anyMatch(p::startsWith);
    }

    /** Under high load, only critical and core get full rate; others get reduced. */
    public boolean allowReducedRateForNonCritical(String path) {
        return !isCritical(path) && !isCore(path);
    }
}
