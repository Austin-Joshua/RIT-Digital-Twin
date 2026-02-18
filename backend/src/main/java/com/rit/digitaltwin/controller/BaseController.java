package com.rit.digitaltwin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "System health and status endpoints")
public class BaseController {

    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Returns system health status")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "application", "RIT Digital Twin",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()));
    }

    @GetMapping("/info")
    @Operation(summary = "System Info", description = "Returns system information")
    public ResponseEntity<Map<String, Object>> systemInfo() {
        return ResponseEntity.ok(Map.of(
                "name", "RIT Digital Twin - Smart Campus Intelligence Platform",
                "institution", "Rajalakshmi Institute of Technology, Chennai",
                "modules", Map.of(
                        "classroom", "Smart Classroom Allocation Engine",
                        "energy", "Energy Consumption Simulation",
                        "transport", "Transport Route Optimization",
                        "crowd", "Crowd Flow & Emergency Simulation",
                        "sustainability", "Sustainability Dashboard",
                        "predictive", "Predictive Analytics Engine")));
    }
}
