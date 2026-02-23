package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final OperationsService operationsService;

    // Transport
    @GetMapping("/transport/routes")
    public ResponseEntity<List<TransportRoute>> getRoutes() {
        return ResponseEntity.ok(operationsService.getAllRoutes());
    }

    // Placement
    @GetMapping("/placement/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    public ResponseEntity<List<PlacementData>> getPlacementStats() {
        return ResponseEntity.ok(operationsService.getAllPlacementRecords());
    }

    // Research
    @PostMapping("/research/upload")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ResearchPublication> uploadPublication(@RequestBody ResearchPublication pub) {
        return ResponseEntity.ok(operationsService.uploadPublication(pub));
    }

    @GetMapping("/research/faculty/{facultyId}")
    public ResponseEntity<List<ResearchPublication>> getFacultyPublications(@PathVariable Long facultyId) {
        return ResponseEntity.ok(operationsService.getFacultyPublications(facultyId));
    }
}
