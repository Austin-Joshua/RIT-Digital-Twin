package com.university.erp.controller;

import com.university.erp.service.CampusAiGateway;
import com.university.erp.service.CampusCopilotService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/copilot")
public class CampusCopilotController {

    private final CampusCopilotService campusCopilotService;
    private final CampusAiGateway campusAiGateway;

    public CampusCopilotController(CampusCopilotService campusCopilotService, CampusAiGateway campusAiGateway) {
        this.campusCopilotService = campusCopilotService;
        this.campusAiGateway = campusAiGateway;
    }

    @GetMapping("/briefing")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> briefing(@RequestParam(required = false) String page,
                                                        @RequestParam(required = false) String entity) {
        return ResponseEntity.ok(campusCopilotService.briefing(page, entity));
    }

    @PostMapping("/ask")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> ask(@RequestBody Map<String, Object> body, Authentication authentication) {
        String query = body.get("query") == null ? "" : String.valueOf(body.get("query"));
        String page = body.get("page") == null ? "" : String.valueOf(body.get("page"));
        String entity = body.get("entity") == null ? "" : String.valueOf(body.get("entity"));
        Map<String, Object> grounded = campusCopilotService.ask(query, page, entity);
        return ResponseEntity.ok(campusAiGateway.finish(query, roleOf(authentication), grounded));
    }

    private static String roleOf(Authentication authentication) {
        if (authentication == null) {
            return "";
        }
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .filter(role -> java.util.List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT").contains(role))
                .findFirst()
                .orElse("");
    }
}
