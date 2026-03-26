package com.university.erp.controller;

import com.university.erp.entity.Company;
import com.university.erp.entity.PlacementOpportunity;
import com.university.erp.entity.PlacementApplication;
import com.university.erp.service.PlacementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/placement")
@RequiredArgsConstructor
public class PlacementController {

    private final PlacementService placementService;

    @GetMapping("/opportunities")
    public List<PlacementOpportunity> getOpportunities() {
        return placementService.getOpenOpportunities();
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PlacementApplication> apply(@RequestBody Map<String, Long> payload) {
        return ResponseEntity.ok(placementService.applyForOpportunity(payload.get("studentId"), payload.get("opportunityId")));
    }

    @PostMapping("/company")
    @PreAuthorize("hasRole('ADMIN')")
    public Company createCompany(@RequestBody Company company) {
        return placementService.createCompany(company);
    }

    @PostMapping("/opportunity")
    @PreAuthorize("hasRole('ADMIN')")
    public PlacementOpportunity publishOpportunity(@RequestBody PlacementOpportunity opportunity) {
        return placementService.publishOpportunity(opportunity);
    }
}
