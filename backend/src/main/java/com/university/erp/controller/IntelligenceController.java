package com.university.erp.controller;

import com.university.erp.security.SessionAccess;
import com.university.erp.service.CampusAlertService;
import com.university.erp.service.CampusDecisionService;
import com.university.erp.service.CampusExperienceService;
import com.university.erp.service.CampusStateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/intelligence")
public class IntelligenceController {

    private final CampusStateService campusStateService;
    private final CampusAlertService campusAlertService;
    private final CampusDecisionService campusDecisionService;
    private final CampusExperienceService campusExperienceService;

    public IntelligenceController(CampusStateService campusStateService,
                                  CampusAlertService campusAlertService,
                                  CampusDecisionService campusDecisionService,
                                  CampusExperienceService campusExperienceService) {
        this.campusStateService = campusStateService;
        this.campusAlertService = campusAlertService;
        this.campusDecisionService = campusDecisionService;
        this.campusExperienceService = campusExperienceService;
    }

    @GetMapping("/experience")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> experience() {
        return ResponseEntity.ok(campusExperienceService.home());
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> alerts() {
        if (!SessionAccess.hasRole("ROLE_ADMIN") && !SessionAccess.hasRole("ROLE_HOD") && !SessionAccess.hasRole("ROLE_FACULTY")) {
            return ResponseEntity.ok(restricted());
        }
        Map<String, Object> state = campusStateService.current();
        Object command = state.get("command");
        if (!(command instanceof Map)) {
            return ResponseEntity.ok(restricted());
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> snapshot = (Map<String, Object>) command;
        Map<String, Object> body = new LinkedHashMap<>(campusAlertService.center(snapshot, sensitive()));
        body.put("restricted", false);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<List<Map<String, String>>> insights() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/alerts/status")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<Map<String, Object>> updateStatus(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(campusAlertService.updateStatus(text(body.get("key")), text(body.get("status"))));
    }

    @GetMapping("/decisions")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> decisions() {
        return ResponseEntity.ok(campusDecisionService.list(sensitive()));
    }

    @PostMapping("/decisions/review")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY')")
    public ResponseEntity<Map<String, Object>> reviewDecision(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(campusDecisionService.review(text(body.get("key")), sensitive()));
    }

    @PostMapping("/decisions/authorize")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<Map<String, Object>> authorizeDecision(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(campusDecisionService.authorize(text(body.get("key")), text(body.get("optionId")), sensitive()));
    }

    @PostMapping("/decisions/{id}/outcome")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<Map<String, Object>> checkOutcome(@PathVariable Long id) {
        return ResponseEntity.ok(campusDecisionService.checkOutcome(id));
    }

    private static Map<String, Object> restricted() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("alerts", new ArrayList<>());
        body.put("predictionCards", new ArrayList<>());
        body.put("coverage", new ArrayList<>());
        body.put("lifecycle", new ArrayList<>());
        body.put("restricted", Boolean.TRUE);
        body.put("because", "Campus alerts include timetable density and are limited to operational roles.");
        return body;
    }

    private static boolean sensitive() {
        return SessionAccess.hasRole("ROLE_ADMIN") || SessionAccess.hasRole("ROLE_HOD");
    }

    private static String text(Object raw) {
        String result = null;
        if (raw != null) {
            result = raw.toString();
        }
        return result;
    }
}
