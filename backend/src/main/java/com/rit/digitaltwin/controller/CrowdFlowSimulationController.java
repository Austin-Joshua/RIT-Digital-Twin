package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.CrowdFlowSimulationRequest;
import com.rit.digitaltwin.dto.CrowdFlowSimulationResponse;
import com.rit.digitaltwin.service.CrowdFlowSimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Crowd Flow Simulation", description = "Crowd density analysis and emergency evacuation planning")
public class CrowdFlowSimulationController {

    private final CrowdFlowSimulationService crowdFlowService;

    @PostMapping("/simulate/crowdflow")
    @Operation(summary = "Run Crowd Flow Simulation", description = "Simulates crowd distribution, detects congestion zones, calculates evacuation times, and scores emergency readiness")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<CrowdFlowSimulationResponse> runSimulation(
            @RequestBody CrowdFlowSimulationRequest request) {
        CrowdFlowSimulationResponse response = crowdFlowService.runSimulation(request);
        return ResponseEntity.ok(response);
    }
}
