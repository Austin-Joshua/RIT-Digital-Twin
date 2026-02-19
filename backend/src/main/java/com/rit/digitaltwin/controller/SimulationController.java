package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.EnergySimulationRequest;
import com.rit.digitaltwin.dto.TransportSimulationRequest;
import com.rit.digitaltwin.dto.CrowdFlowSimulationRequest;
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
    private final EnergySimulationService energyService;
    private final TransportSimulationService transportService;
    private final CrowdFlowSimulationService crowdService;

    @PostMapping("/classroom-allocation")
    public ResponseEntity<Map<String, Object>> runClassroomAllocation(
            @RequestParam int studentCount) {
        return ResponseEntity.ok(classroomService.runAllocationSimulation(studentCount));
    }

    @PostMapping("/energy-optimization")
    public ResponseEntity<?> runEnergyOptimization(@RequestBody(required = false) EnergySimulationRequest request) {
        if (request == null)
            request = new EnergySimulationRequest();
        return ResponseEntity.ok(energyService.runSimulation(request));
    }

    @PostMapping("/transport-optimization")
    public ResponseEntity<?> runTransportOptimization(
            @RequestBody(required = false) TransportSimulationRequest request) {
        if (request == null)
            request = new TransportSimulationRequest();
        return ResponseEntity.ok(transportService.runSimulation(request));
    }

    @PostMapping("/crowd-flow")
    public ResponseEntity<?> runCrowdSimulation(@RequestBody(required = false) CrowdFlowSimulationRequest request) {
        if (request == null)
            request = new CrowdFlowSimulationRequest();
        return ResponseEntity.ok(crowdService.runSimulation(request));
    }
}
