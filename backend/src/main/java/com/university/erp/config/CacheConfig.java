package com.university.erp.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;
import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCacheNames(Arrays.asList(
                "roles",
                "departments",
                "semesters",
                "studentTimetable",
                "studentProfiles",
                "transportRoutes",
                "routeStops",
                "analytics",
                "dept_stats",
                "dept_analytics",
                "class_performance",
                "dept_students",
                "dept_faculty",
                "dept_heatmap",
                "dept_weak_subjects",
                "dept_trends",
                "dept_rankings",
                "studentAdminSectionSummaries"
        ));
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .maximumSize(100_000)
                .recordStats());
        return cacheManager;
    }
}
