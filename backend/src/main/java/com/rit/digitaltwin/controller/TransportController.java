package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.model.TransportRoute;
import com.rit.digitaltwin.service.TransportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    @Autowired
    private TransportService transportService;

    @GetMapping("/routes")
    public ResponseEntity<List<TransportRoute>> getAllRoutes() {
        return ResponseEntity.ok(transportService.getAllRoutes());
    }

    @PostMapping("/optimize/{routeId}")
    public ResponseEntity<SimulationResult> optimizeRoute(@PathVariable Long routeId) {
        return ResponseEntity.ok(transportService.optimizeRoute(routeId));
    }

    @PostMapping("/admin/routes")
    public ResponseEntity<TransportRoute> addRoute(@RequestBody TransportRoute route) {
        return ResponseEntity.ok(transportService.addRoute(route));
    }

    @PutMapping("/admin/routes/{routeId}")
    public ResponseEntity<TransportRoute> updateRoute(@PathVariable Long routeId, @RequestBody TransportRoute route) {
        return ResponseEntity.ok(transportService.updateRoute(routeId, route));
    }
}
