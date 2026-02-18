package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.EnergySimulationRequest;
import com.rit.digitaltwin.dto.EnergySimulationResponse;
import com.rit.digitaltwin.service.EnergySimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Energy Simulation", description = "Energy consumption prediction and optimization")
public class EnergySimulationController {

    private final EnergySimulationService energyService;

    @PostMapping("/simulate/energy")
    @Operation(summary = "Run Energy Simulation", description = "Predicts block-wise energy usage, calculates optimization scenarios, and estimates Solar ROI")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<EnergySimulationResponse> runSimulation(
            @RequestBody EnergySimulationRequest request) {
        EnergySimulationResponse response = energyService.runSimulation(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/energy")
    @Operation(summary = "Get Energy Analytics", description = "Returns current energy analytics with default parameters")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'FACULTY')")
    public ResponseEntity<EnergySimulationResponse> getAnalytics() {
        EnergySimulationResponse response = energyService.getAnalytics();
        return ResponseEntity.ok(response);
    }
}
