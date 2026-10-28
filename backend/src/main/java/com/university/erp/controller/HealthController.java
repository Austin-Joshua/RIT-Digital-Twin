package com.university.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.jdbcTemplate.setQueryTimeout(3);
    }

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            body.put("database", "UP");
            body.put("status", "UP");
            body.put("timestamp", Instant.now().toString());
            body.put("service", "RIT Digital Twin API");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            String errorMessage = (e != null && e.getMessage() != null) ? e.getMessage() : "Database probe failed";
            body.put("database", "DOWN");
            body.put("status", "DOWN");
            body.put("timestamp", Instant.now().toString());
            body.put("error", errorMessage);
            return ResponseEntity.status(503).body(body);
        }
    }
}
