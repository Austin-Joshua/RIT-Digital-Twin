package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.GrowthPassportResponse;
import com.rit.digitaltwin.model.CareerRecommendation;
import com.rit.digitaltwin.service.CareerAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class CareerAnalyticsController {

    private final CareerAnalyticsService careerAnalyticsService;

    @GetMapping("/passport/{studentId}")
    public ResponseEntity<GrowthPassportResponse> getGrowthPassport(@PathVariable Long studentId) {
        return ResponseEntity.ok(careerAnalyticsService.getGrowthPassport(studentId));
    }

    @GetMapping("/career/{studentId}")
    public ResponseEntity<CareerRecommendation> getCareerRecommendation(@PathVariable Long studentId) {
        return ResponseEntity.ok(careerAnalyticsService.getOrGenerateCareerRecommendation(studentId));
    }
}
