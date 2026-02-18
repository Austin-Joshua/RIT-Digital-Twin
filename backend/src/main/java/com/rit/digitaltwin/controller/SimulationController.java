package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final ClassroomAllocationService classroomService;
    private final EnergyOptimizationService energyService;
    private final TransportOptimizationService transportService;

    @PostMapping("/classroom-allocation")
    public ResponseEntity<Map<String, Object>> runClassroomAllocation(
            @RequestParam int studentCount) {
        return ResponseEntity.ok(classroomService.runAllocationSimulation(studentCount));
    }

    @PostMapping("/energy-optimization")
    public ResponseEntity<Map<String, Object>> runEnergyOptimization() {
        return ResponseEntity.ok(energyService.optimizeEnergyUsage());
    }

    @PostMapping("/transport-optimization")
    public ResponseEntity<Map<String, Object>> runTransportOptimization() {
        return ResponseEntity.ok(transportService.analyzeRouteEfficiency());
    }
}
