package com.university.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai/chatbot")
public class ChatbotController {

    @PostMapping("/query")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, String>> chatQuery(
            @RequestParam(required = false, defaultValue = "1") Long studentId,
            @RequestBody Map<String, String> request) {

        String query = request.getOrDefault("query", "").toLowerCase();
        String responseText = generateResponse(query);

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);
        return ResponseEntity.ok(response);
    }

    private String generateResponse(String query) {
        if (query.contains("attendance")) {
            return "Based on your records, your attendance is currently at 87.5%. Keep it up to avoid academic risk!";
        } else if (query.contains("gpa") || query.contains("cgpa") || query.contains("grade")
                || query.contains("marks")) {
            return "Your current CGPA stands at 8.42. You are projected to maintain an 8.5 if you perform well in the upcoming mid-terms.";
        } else if (query.contains("exam") || query.contains("schedule") || query.contains("timetable")) {
            return "Your next exam is Internal Assessment 2 starting from the 15th of next month. Check the 'Time Table' section for details.";
        } else if (query.contains("fee") || query.contains("due") || query.contains("pay")) {
            return "You have no pending fee dues for the current semester. Great! Check the 'Fee Details' section for past receipts.";
        } else if (query.contains("holiday") || query.contains("vacation") || query.contains("leave")) {
            return "The next public holiday is on the 26th. Please view the calendar on your dashboard for all non-instructional days.";
        } else if (query.contains("bus") || query.contains("transport") || query.contains("route")) {
            return "RIT operates 51 bus routes. Click the 'Transport Directory' on the sidebar to find your route details.";
        } else if (query.contains("hello") || query.contains("hi") || query.contains("hey")) {
            return "Hello! I am your AI Academic Assistant. I can help with attendance, grades, exams, fees, and more. Try asking 'What's my CGPA?'";
        } else {
            return "I am an AI assistant deployed for RIT students. I can help answer questions related to your academics, attendance, fees, exams, and transport. How can I assist you further?";
        }
    }
}
