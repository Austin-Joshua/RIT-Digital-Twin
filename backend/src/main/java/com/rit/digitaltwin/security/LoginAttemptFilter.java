package com.rit.digitaltwin.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class LoginAttemptFilter extends OncePerRequestFilter {

    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private final Map<String, Long> lockCache = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME = TimeUnit.MINUTES.toMillis(15);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().equals("/api/auth/login") && request.getMethod().equals("POST")) {
            String ip = request.getRemoteAddr();

            if (isLocked(ip)) {
                response.setStatus(429); // Too Many Requests
                response.getWriter().write("Too many login attempts. Please try again later.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    public void loginFailed(String ip) {
        int attempts = attemptsCache.getOrDefault(ip, 0) + 1;
        attemptsCache.put(ip, attempts);
        if (attempts >= MAX_ATTEMPTS) {
            lockCache.put(ip, System.currentTimeMillis() + LOCK_TIME);
        }
    }

    public void loginSucceeded(String ip) {
        attemptsCache.remove(ip);
        lockCache.remove(ip);
    }

    private boolean isLocked(String ip) {
        if (!lockCache.containsKey(ip))
            return false;
        if (System.currentTimeMillis() > lockCache.get(ip)) {
            lockCache.remove(ip);
            attemptsCache.remove(ip);
            return false;
        }
        return true;
    }
}
