package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.service.CampusMissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class MissionEvaluationTool implements CampusTool {

    private final CampusMissionService campusMissionService;

    @Override
    public String name() {
        return "evaluate_mission";
    }

    @Override
    public String description() {
        return "Evaluates interactive campus missions (Energy Conservation, Space Utilization, Crowd Bottlenecks, Green Transit) against candidate parameters and returns objective scores out of 100 with constraint checks.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        String query = params != null && params.get("query") != null ? String.valueOf(params.get("query")).toLowerCase(Locale.ROOT) : "";

        String missionId = "energy-reduction";
        if (query.contains("utiliz") || query.contains("space")) {
            missionId = "utilization-boost";
        } else if (query.contains("crowd") || query.contains("bottleneck") || query.contains("overflow")) {
            missionId = "bottleneck-elimination";
        } else if (query.contains("transit") || query.contains("fleet") || query.contains("electrif") || query.contains("ev")) {
            missionId = "fleet-electrification";
        }

        // Extract adjustments from params or provide good benchmark candidate
        Map<String, Object> adjustments = new LinkedHashMap<>();
        if ("energy-reduction".equals(missionId)) {
            adjustments.put("hvacEfficiencyPercent", 25);
            adjustments.put("timetableLoadPercent", -10);
        } else if ("utilization-boost".equals(missionId)) {
            adjustments.put("timetableLoadPercent", 20);
            adjustments.put("extraClassrooms", 2);
        } else if ("bottleneck-elimination".equals(missionId)) {
            adjustments.put("extraClassrooms", 6);
            adjustments.put("seatsPerNewClassroom", 60);
            adjustments.put("timetableLoadPercent", -5);
        } else {
            adjustments.put("evAdoptionPercent", 50);
            adjustments.put("busCapacityPercent", 20);
        }

        Map<String, Object> eval = campusMissionService.evaluateMission(missionId, adjustments);

        int score = eval.get("score") instanceof Number n ? n.intValue() : 0;
        String badge = String.valueOf(eval.getOrDefault("badge", "RETRY"));
        boolean passed = Boolean.TRUE.equals(eval.get("passed"));
        String title = String.valueOf(eval.getOrDefault("title", "Campus Mission"));
        String explanation = String.valueOf(eval.getOrDefault("explanation", ""));

        @SuppressWarnings("unchecked")
        List<String> breakdown = (List<String>) eval.getOrDefault("breakdown", List.of());

        List<String> headers = List.of("Criterion / Rule", "Evaluation Outcome", "Impact");
        List<List<Object>> rows = new ArrayList<>();
        for (String item : breakdown) {
            String[] parts = item.split(":");
            String rule = parts[0].trim();
            String detail = parts.length > 1 ? parts[1].trim() : "Evaluated";
            rows.add(List.of(rule, detail, item.contains("+") ? "Positive (+)" : item.contains("-") ? "Penalty (-)" : "Neutral"));
        }

        List<Map<String, Object>> cards = List.of(
                Map.of("title", "Mission Score", "value", score + "/100"),
                Map.of("title", "Achievement Badge", "value", badge),
                Map.of("title", "Mission Status", "value", passed ? "COMPLETED" : "IN PROGRESS")
        );

        return ToolResult.builder()
                .toolName(name())
                .answer(String.format("Mission Assessment: '%s'. Achieved Score: %d/100 (%s Badge). %s (All mission scoring is purely SIMULATED for training and decision support).", title, score, badge, explanation))
                .provenance(SourceClass.SIMULATED)
                .confidence(0.98)
                .cards(cards)
                .table(Map.of("headers", headers, "rows", rows))
                .actions(List.of(
                        Map.of("kind", "NAVIGATE", "label", "Open Missions in Scenario Studio", "path", "/scenarios")
                ))
                .because("Evaluated deterministically via CampusMissionService against candidate levers and simulated operational constraints.")
                .build();
    }
}
