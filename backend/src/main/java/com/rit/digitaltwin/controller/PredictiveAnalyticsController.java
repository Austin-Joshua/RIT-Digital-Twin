package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.PredictiveForecastResponse;
import com.rit.digitaltwin.service.PredictiveAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Predictive Analytics", description = "Regression-based next-semester infrastructure demand forecasting")
public class PredictiveAnalyticsController {

    private final PredictiveAnalyticsService analyticsService;

    @GetMapping("/predictive")
    @Operation(summary = "Get Predictive Forecast", description = "Returns regression-based forecast for next semester: enrollment, infrastructure, energy, and transport demand")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<PredictiveForecastResponse> getForecast(
            @RequestParam(defaultValue = "STUDENT_ENROLLMENT") String metric,
            @RequestParam(defaultValue = "6") int months) {
        PredictiveForecastResponse response = analyticsService.generateForecast(metric, months);
        return ResponseEntity.ok(response);
    }
}
