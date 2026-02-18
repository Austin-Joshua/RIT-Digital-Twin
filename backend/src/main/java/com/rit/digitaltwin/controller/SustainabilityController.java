package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.SustainabilityDashboardResponse;
import com.rit.digitaltwin.service.SustainabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sustainability")
@RequiredArgsConstructor
@Tag(name = "Sustainability Dashboard", description = "Composite sustainability index and environmental metrics")
public class SustainabilityController {

    private final SustainabilityService sustainabilityService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get Sustainability Dashboard", description = "Returns composite sustainability index combining energy, transport, infrastructure, and carbon footprint metrics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'FACULTY')")
    public ResponseEntity<SustainabilityDashboardResponse> getDashboard() {
        SustainabilityDashboardResponse response = sustainabilityService.getDashboard();
        return ResponseEntity.ok(response);
    }
}
