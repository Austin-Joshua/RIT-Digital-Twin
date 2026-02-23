package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/query")
    public ResponseEntity<Map<String, String>> askQuery(
            @RequestParam Long studentId,
            @RequestBody Map<String, String> request) {
        String query = request.get("query");
        String response = chatbotService.processQuery(studentId, query);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
