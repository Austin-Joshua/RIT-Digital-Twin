package com.university.erp.controller;

import com.university.erp.dto.CampusBuildingGeoDto;
import com.university.erp.service.CampusSpatialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campus")
@RequiredArgsConstructor
public class CampusBuildingController {

    private final CampusSpatialService campusSpatialService;

    @GetMapping("/reference")
    public ResponseEntity<Map<String, Object>> getCampusReference() {
        return ResponseEntity.ok(Map.of(
                "collegeName", "Rajalakshmi Institute of Technology (RIT)",
                "location", "Kuthambakkam, Chennai, Tamil Nadu, India",
                "latitude", 13.0389,
                "longitude", 80.0449,
                "crs", "WGS84 (EPSG:4326)",
                "areaSqm", 44029,
                "builtSqm", 16297
        ));
    }

    @GetMapping("/buildings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CampusBuildingGeoDto>> getGeospatialBuildings() {
        return ResponseEntity.ok(campusSpatialService.getGeospatialBuildings());
    }

    @GetMapping("/buildings/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getGeospatialBuilding(@PathVariable Long id) {
        return campusSpatialService.getGeospatialBuilding(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(null));
    }

    @PutMapping("/buildings/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyBuildingGeometry(@PathVariable Long id,
                                                   @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "VERIFIED");
        String note = payload.get("note");
        return campusSpatialService.verifyGeometry(id, status, note)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(null));
    }
}
