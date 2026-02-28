package com.university.erp.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class BroadcastController {

    // When client sends to /app/broadcast, backend handles it here
    @MessageMapping("/broadcast")
    // Sends the returned payload to all clients subscribed to /topic/broadcasts
    @SendTo("/topic/broadcasts")
    public Map<String, String> handleGlobalBroadcast(Map<String, String> payload) {
        // e.g. payload: { "sender": "ADMIN", "message": "Emergency Meeting at 10 AM",
        // "severity": "HIGH" }
        payload.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return payload;
    }
}
