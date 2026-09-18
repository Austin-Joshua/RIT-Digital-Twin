package com.university.erp.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Institutional-Grade Rate Limiter for RIT Digital Twin.
 * Using Caffeine to manage request counters for 1000s of simultaneous students.
 * Prevents API saturation and potential institutional-scale DDoS.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS_PER_MINUTE = 600; // 10 requests per second on average
    private static final int MAX_AUTH_REQUESTS_PER_MINUTE = 10; // Stricter limit for auth endpoints

    private final Cache<String, AtomicInteger> requestCounts;
    private final Cache<String, AtomicInteger> authRequestCounts;

    public RateLimitInterceptor() {
        this.requestCounts = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(1))
                .maximumSize(100000) // Support 100k active scaling user-sessions
                .build();
                
        this.authRequestCounts = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(1))
                .maximumSize(100000)
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        
        // 1. Specific Auth Route Rate Limiting
        if ("POST".equalsIgnoreCase(request.getMethod()) && (path.endsWith("/api/auth/register") || path.endsWith("/api/auth/login"))) {
            AtomicInteger authCount = authRequestCounts.get(clientIp, k -> new AtomicInteger(0));
            if (authCount.incrementAndGet() > MAX_AUTH_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("{\"error\": \"Too Many Requests\", \"message\": \"Auth rate limit exceeded. Please wait a minute.\"}");
                response.setContentType("application/json");
                return false;
            }
        }
        
        // 2. Global Rate Limiting
        AtomicInteger count = requestCounts.get(clientIp, k -> new AtomicInteger(0));
        
        if (count.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"error\": \"Too Many Requests\", \"message\": \"Institutional rate limit exceeded. Please wait a minute.\"}");
            response.setContentType("application/json");
            return false;
        }
        
        return true;
    }
}
