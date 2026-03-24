package com.university.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @GetMapping("/forecast")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> forecast(@RequestParam String metric,
                                                         @RequestParam(defaultValue = "6") int months) {
        int horizon = Math.max(3, Math.min(months, 12));
        double growth = switch (metric) {
            case "ENERGY_DEMAND" -> 9.2;
            case "TRAFFIC_CONGESTION" -> 7.6;
            case "SPACE_UTILIZATION" -> 11.3;
            default -> 14.5;
        };
        int base = switch (metric) {
            case "ENERGY_DEMAND" -> 520;
            case "TRAFFIC_CONGESTION" -> 68;
            case "SPACE_UTILIZATION" -> 72;
            default -> 1200;
        };

        List<String> labels = List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        List<Map<String, Object>> points = new ArrayList<>();
        for (int i = 0; i < horizon; i++) {
            int v = (int) Math.round(base * (1 + (growth / 100.0) * ((i + 1) / (double) horizon)));
            points.add(Map.of(
                    "monthIndex", labels.get(i),
                    "value", v,
                    "upperBound", (int) Math.round(v * 1.08),
                    "lowerBound", (int) Math.round(v * 0.92)
            ));
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("metric", metric);
        out.put("predictedGrowthRate", growth);
        out.put("forecastData", points);
        out.put("recommendations", List.of(
                "Align staffing and room allocation with projected demand windows.",
                "Run bi-weekly recalibration using latest telemetry and attendance trends.",
                "Prioritize high-variance clusters for proactive intervention."
        ));
        return ResponseEntity.ok(out);
    }
}
