package com.university.erp.controller;

import com.university.erp.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/ai/chatbot")
public class ChatbotController {

    private final AiService aiService;

    public ChatbotController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/query")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public ResponseEntity<Map<String, String>> chatQuery(
            @RequestParam(required = false, defaultValue = "1") Long studentId,
            @RequestParam(required = false, defaultValue = "STUDENT") String role,
            @RequestBody Map<String, String> request) {

        String query = request.getOrDefault("query", "").trim();
        String responseText = generateResponse(query.toLowerCase(), role.toUpperCase(), studentId);

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);
        return ResponseEntity.ok(response);
    }

    private String generateResponse(String query, String role, Long studentId) {
        if (query.isEmpty()) {
            return "Please type a question. I can help with attendance, grades, exams, transport, library, outpass, and more.";
        }

        // Student-specific: academic risk & career (uses AiService)
        if (studentId != null && ("STUDENT".equals(role) || "PARENT".equals(role))) {
            if (query.contains("risk") || query.contains("at risk") || query.contains("academic risk")) {
                try {
                    String risk = aiService.predictAcademicRisk(studentId);
                    String advice = "HIGH_RISK".equals(risk) ? "Consider meeting your advisor and focusing on arrears."
                            : "MODERATE_RISK".equals(risk) ? "Keep attending classes and aim for better internal marks."
                            : "You're on track. Keep it up!";
                    return "Academic risk level: " + risk.replace("_", " ") + ".\n\n" + advice + "\n\nView your dashboard for detailed analytics.";
                } catch (Exception e) {
                    return "Academic risk: Check your attendance and CGPA on the dashboard. Low attendance or CGPA below 5 increases risk.";
                }
            }
            if (query.contains("career") || query.contains("job") || query.contains("placement")) {
                try {
                    List<String> recs = aiService.recommendCareer(studentId);
                    return "Based on your profile, consider exploring:\n\n• " + String.join("\n• ", recs) + "\n\nCheck the Placement cell and Training section for more.";
                } catch (Exception e) {
                    return "Career tips: Improve CGPA and skills. Visit the Placement / Training section for opportunities.";
                }
            }
        }

        // Faculty / HOD
        if ("FACULTY".equals(role) || "HOD".equals(role)) {
            if (query.contains("grading") || query.contains("marks") || query.contains("score")) {
                return "You have 3 assignments pending for grading in CS8651.\n\nOpen the Assessment Portal from the sidebar to submit marks.";
            }
            if (query.contains("leave") || query.contains("approval") || query.contains("request") || query.contains("od")) {
                return "There are 4 pending leave requests from your students (CSE-A).\n\nReview them in: Approval Queue / Faculty Leave.";
            }
            if (query.contains("publication") || query.contains("research") || query.contains("paper")) {
                return "Your latest publication 'AI in EdTech' has been indexed.\n\nYou have 2 more drafts in the research tracker.";
            }
            if (query.contains("ward") || query.contains("proctor") || query.contains("student")) {
                return "You are mentoring 12 proctor wards.\n\n'Aakash S' has shown 15% improvement in attendance. Check Proctor section for details.";
            }
            if ("HOD".equals(role)) {
                if (query.contains("performance") || query.contains("department")) {
                    return "Department: 94% syllabus completion.\n\n2 faculty have pending lesson plans. See Staff Management.";
                }
                if (query.contains("load") || query.contains("timetable") || query.contains("allocation")) {
                    return "Faculty load for next semester is 95% allocated.\n\nReview Staff Management for remaining slots.";
                }
            }
        }

        // Parent
        if ("PARENT".equals(role)) {
            if (query.contains("attendance") || query.contains("absent")) {
                return "Your ward's attendance is available on the dashboard.\n\nGo to: Parent Dashboard → Attendance Pulse.";
            }
            if (query.contains("fee") || query.contains("due") || query.contains("pay")) {
                return "Fee status is shown in Fee Dues on the dashboard.\n\nNo pending dues for current semester if the dashboard shows clear.";
            }
            if (query.contains("meeting") || query.contains("schedule") || query.contains("meet")) {
                return "You can request a meeting with faculty from the Parent Dashboard.\n\nUse 'Schedule Meeting' or contact the department office.";
            }
        }

        // Admin
        if ("ADMIN".equals(role)) {
            if (query.contains("energy") || query.contains("audit") || query.contains("consumption")) {
                return "Energy audit: Use the Energy Optimization module.\n\nYou can view building-wise usage and run AI simulations there.";
            }
            if (query.contains("broadcast") || query.contains("alert") || query.contains("announcement")) {
                return "Send broadcasts from: Broadcast / Notifications.\n\nYou can target by role or department.";
            }
            if (query.contains("health") || query.contains("system") || query.contains("status")) {
                return "System health: Check the dashboard KPIs and server status.\n\nBackend and database are reported in the admin panel.";
            }
        }

        // Common / Student
        if (query.contains("attendance")) {
            return "Your attendance is currently at 87.5%.\n\nKeep it above 75% to avoid academic risk. Check Dashboard for details.";
        }
        if (query.contains("gpa") || query.contains("cgpa") || query.contains("grade")) {
            return "Current CGPA: 8.42.\n\nYou can maintain 8.5+ with good performance in upcoming internals. Use CGPA Simulator for what‑if scenarios.";
        }
        if (query.contains("exam") || query.contains("schedule") || query.contains("timetable") || query.contains("hall")) {
            return "Next exam: Internal Assessment 2 from the 15th of next month.\n\nCheck Time Table for dates and exam hall details.";
        }
        if (query.contains("fee") || query.contains("due") || query.contains("pay")) {
            return "No pending fee dues for the current semester.\n\nPast receipts: Fee Details section.";
        }
        if (query.contains("holiday") || query.contains("vacation")) {
            return "Next public holiday: 26th.\n\nView the dashboard calendar for all non-instructional days.";
        }
        if (query.contains("bus") || query.contains("transport") || query.contains("route")) {
            return "RIT runs 51 bus routes.\n\nGo to: Transport Directory (sidebar) for route numbers and timings.";
        }
        if (query.contains("library") || query.contains("book") || query.contains("issue")) {
            return "Library: Use the Library section to see issued books and due dates.\n\nRenew or return from the same page.";
        }
        if (query.contains("outpass") || query.contains("out pass") || query.contains("gate")) {
            return "Digital outpass: Apply from the Outpass / Gate Pass section.\n\nApproval is sent to your email and shown on dashboard.";
        }
        if (query.contains("digital twin") || query.contains("campus") || query.contains("energy") || query.contains("sustainability")) {
            return "Digital Twin covers:\n\n• Classroom allocation\n• Energy optimization\n• Transport & sustainability\n\nUse the sidebar modules for each.";
        }
        if (query.contains("hello") || query.contains("hi") || query.contains("hey")) {
            String help = "STUDENT".equals(role) ? "attendance, grades, exams, transport, library, outpass."
                    : "PARENT".equals(role) ? "ward attendance, fees, and scheduling meetings."
                    : "ADMIN".equals(role) ? "energy audit, broadcasts, and system health."
                    : "grading, leave approvals, and research.";
            return "Hello! I'm your RIT AI Assistant. I can help with " + help + "\n\nAsk anything or use the quick buttons below.";
        }

        return "I can help with attendance, grades, exams, fees, transport, library, outpass, and more.\n\nTry: \"What's my attendance?\" or \"Exam schedule\" or use a quick action below.";
    }
}
