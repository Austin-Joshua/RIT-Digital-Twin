package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.CrowdData;
import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.service.CrowdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crowd")
public class CrowdController {

    @Autowired
    private CrowdService crowdService;

    @GetMapping("/data")
    public ResponseEntity<List<CrowdData>> getCrowdData(@RequestParam(required = false) Long buildingId) {
        return ResponseEntity.ok(crowdService.getCrowdData(buildingId));
    }

    @PostMapping("/simulate")
    public ResponseEntity<SimulationResult> simulateEvacuation(@RequestBody Map<String, Object> params) {
        Long buildingId = Long.valueOf(params.get("buildingId").toString());
        int occupancy = Integer.parseInt(params.get("occupancy").toString());
        return ResponseEntity.ok(crowdService.simulateEvacuation(buildingId, occupancy));
    }
}
