package com.rit.digitaltwin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    @GetMapping("/predictions")
    public ResponseEntity<Map<String, Object>> getPredictions() {
        // Mocking predictive analytics
        return ResponseEntity.ok(Map.of(
                "nextSemesterDemand", "High",
                "predictedEnergyGrowth", "5%",
                "trends", List.of(10, 12, 15, 14, 18, 20)));
    }
}
