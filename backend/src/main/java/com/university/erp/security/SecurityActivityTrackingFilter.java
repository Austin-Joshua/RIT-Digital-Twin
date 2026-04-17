package com.university.erp.security;

import com.university.erp.model.User;
import com.university.erp.service.RequestSecurityMonitoringService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityActivityTrackingFilter extends OncePerRequestFilter {

    private final RequestSecurityMonitoringService monitoringService;

    public SecurityActivityTrackingFilter(RequestSecurityMonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null) return true;
        return path.startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } finally {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = null;
            String username = "anonymous";
            if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof User user) {
                userId = user.getUserId();
                username = user.getUsername();
            }
            monitoringService.recordRequest(request, response.getStatus(), userId, username);
        }
    }
}
