package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.EnergyLog;
import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.service.EnergyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/energy")
public class EnergyController {

    @Autowired
    private EnergyService energyService;

    @GetMapping("/logs")
    public ResponseEntity<List<EnergyLog>> getLogs(@RequestParam(required = false) Long buildingId) {
        return ResponseEntity.ok(energyService.getEnergyLogs(buildingId));
    }

    @PostMapping("/optimize/{buildingId}")
    public ResponseEntity<SimulationResult> optimize(@PathVariable Long buildingId) {
        return ResponseEntity.ok(energyService.optimizeEnergy(buildingId));
    }
}
