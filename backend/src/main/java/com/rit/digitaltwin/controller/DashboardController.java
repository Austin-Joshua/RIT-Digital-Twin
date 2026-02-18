package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SustainabilityService sustainabilityService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        return ResponseEntity.ok(Map.of(
                "sustainabilityScore", sustainabilityService.calculateCompositeScore(),
                "activeAlerts", 2,
                "systemStatus", "ONLINE"));
    }
}
