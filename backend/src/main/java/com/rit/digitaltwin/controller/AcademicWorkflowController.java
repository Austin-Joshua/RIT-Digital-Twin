package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.Ranking;
import com.rit.digitaltwin.service.AcademicWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/academic/workflow")
@RequiredArgsConstructor
public class AcademicWorkflowController {

    private final AcademicWorkflowService academicWorkflowService;

    @PostMapping("/calculate-rankings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> calculateRankings(@RequestParam Long deptId, @RequestParam Integer semester) {
        academicWorkflowService.calculateRankings(deptId, semester);
        return ResponseEntity.ok("Rankings calculated successfully");
    }

    @PostMapping("/publish-results")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> publishResults(@RequestParam Long deptId, @RequestParam Integer semester) {
        academicWorkflowService.publishResults(deptId, semester);
        return ResponseEntity.ok("Results published and notifications sent");
    }

    @GetMapping("/top-rankers")
    public ResponseEntity<List<Ranking>> getTopRankers(@RequestParam Long deptId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(academicWorkflowService.getTopRankers(deptId, limit));
    }
}
