package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.TransportSimulationRequest;
import com.rit.digitaltwin.dto.TransportSimulationResponse;
import com.rit.digitaltwin.service.TransportSimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Transport Optimization", description = "Transport route optimization and fleet management")
public class TransportSimulationController {

    private final TransportSimulationService transportService;

    @PostMapping("/simulate/transport")
    @Operation(summary = "Run Transport Simulation", description = "Simulates route efficiency, fuel usage, student cluster mapping, and EV replacement scenario")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<TransportSimulationResponse> runSimulation(
            @RequestBody TransportSimulationRequest request) {
        TransportSimulationResponse response = transportService.runSimulation(request);
        return ResponseEntity.ok(response);
    }
}
