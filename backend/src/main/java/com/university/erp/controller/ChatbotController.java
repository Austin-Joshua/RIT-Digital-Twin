package com.university.erp.controller;

import com.university.erp.service.CampusCopilotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Kept so older clients do not receive invented counts. Role is taken from the login, not the request.
 */
@RestController
@RequestMapping("/api/ai/chatbot")
public class ChatbotController {

    private final CampusCopilotService campusCopilotService;

    public ChatbotController(CampusCopilotService campusCopilotService) {
        this.campusCopilotService = campusCopilotService;
    }

    @PostMapping("/query")
    @PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, Object>> chatQuery(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("query", "");
        String page = request.getOrDefault("page", "");
        return ResponseEntity.ok(campusCopilotService.ask(query, page, request.get("entity")));
    }
}
