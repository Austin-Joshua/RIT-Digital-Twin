package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.ClassroomSimulationRequest;
import com.rit.digitaltwin.dto.ClassroomSimulationResponse;
import com.rit.digitaltwin.service.ClassroomAllocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulation/classroom")
@RequiredArgsConstructor
@Tag(name = "Smart Classroom Allocation", description = "Classroom allocation simulation engine")
public class ClassroomSimulationController {

    private final ClassroomAllocationService allocationService;

    @PostMapping
    @Operation(summary = "Run Classroom Allocation Simulation", description = "Analyzes available classrooms and recommends optimal allocation based on student count, time slot, and amenity requirements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'FACULTY')")
    public ResponseEntity<ClassroomSimulationResponse> runSimulation(
            @Valid @RequestBody ClassroomSimulationRequest request) {
        ClassroomSimulationResponse response = allocationService.runSimulation(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Simulation Result", description = "Retrieve a previously saved classroom allocation simulation result by ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'FACULTY')")
    public ResponseEntity<ClassroomSimulationResponse> getSimulation(@PathVariable Long id) {
        ClassroomSimulationResponse response = allocationService.getSimulationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    @Operation(summary = "Get Recent Simulations", description = "Retrieve the 10 most recent classroom allocation simulations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<List<ClassroomSimulationResponse>> getRecentSimulations() {
        List<ClassroomSimulationResponse> results = allocationService.getRecentSimulations();
        return ResponseEntity.ok(results);
    }
}
