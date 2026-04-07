package com.university.erp.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Institutional Web Configuration for the RIT Digital Twin.
 * Registers the global Rate Limiting engine and other web-layer scaling policies.
 * Ensures the platform remains responsive for 1000s of simultaneous RIT students.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply rate limiting to all REST API endpoints
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**", "/h2-console/**"); // Exclude critical auth paths for initial login
    }
}
