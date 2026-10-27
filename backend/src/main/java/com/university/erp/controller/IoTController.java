package com.university.erp.controller;

import com.university.erp.service.SyntheticTelemetryEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IoTController {

    private final SyntheticTelemetryEngine syntheticTelemetryEngine;

    @GetMapping("/campus-overview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCampusOverview(
            @RequestParam(required = false) String scenario,
            @RequestParam(required = false) String clock) {
        LocalTime parsed = clock != null && !clock.isBlank() ? LocalTime.parse(clock) : null;
        return ResponseEntity.ok(syntheticTelemetryEngine.getCampusOverview(scenario, parsed));
    }
}
