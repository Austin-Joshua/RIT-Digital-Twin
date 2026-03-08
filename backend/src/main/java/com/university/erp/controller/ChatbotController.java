package com.university.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai/chatbot")
public class ChatbotController {

    @PostMapping("/query")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, String>> chatQuery(
            @RequestParam(required = false, defaultValue = "1") Long studentId,
            @RequestParam(required = false, defaultValue = "STUDENT") String role,
            @RequestBody Map<String, String> request) {

        String query = request.getOrDefault("query", "").toLowerCase();
        String responseText = generateResponse(query, role.toUpperCase());

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);
        return ResponseEntity.ok(response);
    }

    private String generateResponse(String query, String role) {
        // Faculty / HOD Specific Logic
        if ("FACULTY".equals(role) || "HOD".equals(role)) {
            if (query.contains("grading") || query.contains("marks") || query.contains("score")) {
                return "You have 3 assignments pending for grading in CS8651. Would you like to open the Assessment Portal?";
            } else if (query.contains("leave") || query.contains("approval") || query.contains("request")) {
                return "There are 4 pending leave requests from your students (CSE-A). You can review them in the 'Approval Queue'.";
            } else if (query.contains("publication") || query.contains("research") || query.contains("paper")) {
                return "Your latest publication 'AI in EdTech' has been successfully indexed. You have 2 more drafts in the tracker.";
            } else if (query.contains("ward") || query.contains("proctor") || query.contains("student")) {
                return "You are currently mentoring 12 proctor wards. 'Aakash S' has shown a 15% improvement in attendance recently.";
            }

            if ("HOD".equals(role)) {
                if (query.contains("performance") || query.contains("department")) {
                    return "Department performance is currently at 94% syllabus completion. 2 faculty members have pending lesson plans.";
                } else if (query.contains("load") || query.contains("timetable")) {
                    return "The faculty load for next semester is 95% allocated. Review the 'Staff Management' for the remaining slots.";
                }
            }
        }

        // Common / Student Logic
        if (query.contains("attendance")) {
            return "Based on your records, your attendance is currently at 87.5%. Keep it up to avoid academic risk!";
        } else if (query.contains("gpa") || query.contains("cgpa") || query.contains("marks")) {
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
            return "Hello! I am your AI Academic Assistant. I can help with " +
                    ("STUDENT".equals(role) ? "attendance, grades, and exams."
                            : "grading, student approvals, and research.");
        } else {
            return "I am an AI assistant for RIT. I can help with academics, attendance, fees, exams, and more. How can I assist you further?";
        }
    }
}
