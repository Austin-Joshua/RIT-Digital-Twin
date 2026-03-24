package com.university.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/intelligence")
public class IntelligenceController {

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<List<Map<String, String>>> alerts() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "priority", "INFO",
                        "category", "SYSTEM",
                        "message", "All core academic services are online.",
                        "suggestion", "Proceed with regular dashboard workflows."
                )
        ));
    }

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<List<Map<String, String>>> insights() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "category", "ACADEMIC",
                        "message", "Attendance and grade pipelines are synchronized.",
                        "suggestion", "Review weekly trend cards for early interventions."
                ),
                Map.of(
                        "category", "OPERATIONS",
                        "message", "Core ERP services are responding within normal latency.",
                        "suggestion", "Use dashboard quick actions for live demo flow."
                )
        ));
    }
}
