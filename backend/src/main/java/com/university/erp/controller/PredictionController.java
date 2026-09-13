package com.university.erp.controller;

import com.university.erp.intelligence.Provenance;
import com.university.erp.intelligence.SourceClass;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("metric", metric);
        out.put("available", false);
        out.put("horizonMonths", horizon);
        out.put("predictedGrowthRate", null);
        out.put("forecastData", List.of());
        out.put("recommendations", List.of(
                "No prediction available. This metric has no stored history to forecast from."
        ));
        return ResponseEntity.ok(Provenance.stamp(out, SourceClass.PREDICTED,
                "No campus history is stored for this metric, so no growth series is produced."));
    }
}
