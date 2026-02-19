package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.SustainabilityMetric;
import com.rit.digitaltwin.service.SustainabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sustainability")
public class SustainabilityController {

    @Autowired
    private SustainabilityService sustainabilityService;

    @GetMapping("/history")
    public ResponseEntity<List<SustainabilityMetric>> getHistory() {
        return ResponseEntity.ok(sustainabilityService.getHistory());
    }

    @PostMapping("/calculate")
    public ResponseEntity<SustainabilityMetric> calculateCurrent() {
        return ResponseEntity.ok(sustainabilityService.calculateCurrentMetrics());
    }
}
