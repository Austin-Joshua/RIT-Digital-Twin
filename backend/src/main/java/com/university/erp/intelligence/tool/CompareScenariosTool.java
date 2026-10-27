package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.service.ScenarioSimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class CompareScenariosTool implements CampusTool {

    private final ScenarioSimulationService scenarioSimulationService;

    @Override
    public String name() {
        return "compare_scenarios";
    }

    @Override
    public String description() {
        return "Compares baseline campus operations against one or more scenario presets (e.g. normal day vs examination day, energy saving, peak demand, fleet electrification) with multi-objective trade-offs.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        String query = params != null && params.get("query") != null ? String.valueOf(params.get("query")).toLowerCase(Locale.ROOT) : "";

        // Resolve presets to compare based on query
        List<Map<String, Object>> selectedScenarios = new ArrayList<>();
        Map<String, Object> catalog = scenarioSimulationService.catalog();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> presets = (List<Map<String, Object>>) catalog.getOrDefault("presets", List.of());

        if (query.contains("exam")) {
            findPreset(presets, "exam-day").ifPresent(p -> selectedScenarios.add(toScenarioInput("Examination Day", p)));
        }
        if (query.contains("energy") || query.contains("save") || query.contains("saving") || query.contains("reduces energy")) {
            findPreset(presets, "energy-saving").ifPresent(p -> selectedScenarios.add(toScenarioInput("Energy-Saving Operation", p)));
        }
        if (query.contains("peak") || query.contains("demand")) {
            findPreset(presets, "peak-demand").ifPresent(p -> selectedScenarios.add(toScenarioInput("Peak-Hour Demand", p)));
        }
        if (query.contains("transport") || query.contains("fleet") || query.contains("electrif") || query.contains("ev")) {
            findPreset(presets, "transport-electrification").ifPresent(p -> selectedScenarios.add(toScenarioInput("Fleet Electrification", p)));
        }
        if (query.contains("crowd") || query.contains("emergency") || query.contains("corridor")) {
            findPreset(presets, "emergency-crowd").ifPresent(p -> selectedScenarios.add(toScenarioInput("Emergency Crowd Management", p)));
        }
        if (query.contains("classroom") || query.contains("intake") || query.contains("utilization")) {
            findPreset(presets, "classroom-demand-up").ifPresent(p -> selectedScenarios.add(toScenarioInput("Classroom Demand +25%", p)));
        }

        // Default comparison if specific presets not matched
        if (selectedScenarios.isEmpty()) {
            findPreset(presets, "normal-day").ifPresent(p -> selectedScenarios.add(toScenarioInput("Normal Day", p)));
            findPreset(presets, "exam-day").ifPresent(p -> selectedScenarios.add(toScenarioInput("Examination Day", p)));
            findPreset(presets, "energy-saving").ifPresent(p -> selectedScenarios.add(toScenarioInput("Energy-Saving Day", p)));
        } else if (selectedScenarios.size() == 1) {
            // Pair with Normal Day or Energy-Saving for side-by-side comparison
            if (!selectedScenarios.get(0).get("name").toString().contains("Normal")) {
                findPreset(presets, "normal-day").ifPresent(p -> selectedScenarios.add(0, toScenarioInput("Normal Day", p)));
            } else {
                findPreset(presets, "exam-day").ifPresent(p -> selectedScenarios.add(toScenarioInput("Examination Day", p)));
            }
        }

        // Limit to max 3 scenarios
        List<Map<String, Object>> capped = selectedScenarios.subList(0, Math.min(3, selectedScenarios.size()));
        Map<String, Object> preview = scenarioSimulationService.preview(Map.of("scenarios", capped));

        @SuppressWarnings("unchecked")
        Map<String, Object> current = (Map<String, Object>) preview.getOrDefault("current", Map.of());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> scenarios = (List<Map<String, Object>>) preview.getOrDefault("scenarios", List.of());
        @SuppressWarnings("unchecked")
        Map<String, Object> recommendation = (Map<String, Object>) preview.getOrDefault("recommendation", Map.of());

        // Build comparison table headers and rows
        List<String> headers = new ArrayList<>();
        headers.add("Campus Metric");
        headers.add("Current Baseline");
        for (Map<String, Object> sc : scenarios) {
            headers.add(String.valueOf(sc.get("name")));
        }

        List<List<Object>> rows = new ArrayList<>();
        addMetricRow(rows, "Building Energy Demand", "energy", current, scenarios);
        addMetricRow(rows, "Classroom Utilization", "utilization", current, scenarios);
        addMetricRow(rows, "Average Crowd Density", "crowd", current, scenarios);
        addMetricRow(rows, "Rooms Over Capacity", "overflowRooms", current, scenarios);
        addMetricRow(rows, "Carbon Emissions", "carbonEmissions", current, scenarios);
        addMetricRow(rows, "Resource Shortfall", "resourceDemand", current, scenarios);

        List<Map<String, Object>> cards = new ArrayList<>();
        cards.add(Map.of("title", "Baseline Energy", "value", String.valueOf(getVal(current, "energy")), "unit", "kW"));
        if (!scenarios.isEmpty()) {
            Map<String, Object> firstSim = (Map<String, Object>) scenarios.get(0).get("simulated");
            cards.add(Map.of("title", scenarios.get(0).get("name") + " Energy", "value", String.valueOf(getVal(firstSim, "energy")), "unit", "kW"));
            if (scenarios.size() > 1) {
                Map<String, Object> secSim = (Map<String, Object>) scenarios.get(1).get("simulated");
                cards.add(Map.of("title", scenarios.get(1).get("name") + " Energy", "value", String.valueOf(getVal(secSim, "energy")), "unit", "kW"));
            }
        }

        String bestScenario = recommendation.get("best") != null ? String.valueOf(recommendation.get("best")) : "Baseline";
        String why = recommendation.get("why") != null ? String.valueOf(recommendation.get("why")) : "";

        String answer = String.format(
                "Digital Twin Multi-Objective Scenario Comparison: Compared %d scenario preset(s) against current campus baseline. %s " +
                "Summary findings: %s. Trade-off notice: Optimizing one dimension (such as maximizing classroom utilization) typically impacts crowd density or HVAC load. All numbers are computed deterministically via ScenarioSimulationService and are strictly SIMULATED.",
                scenarios.size(),
                recommendation.get("best") != null ? "Best overall balance on facilities pressure is: '" + bestScenario + "'." : "All tested scenarios maintain similar facilities pressure.",
                why
        );

        return ToolResult.builder()
                .toolName(name())
                .answer(answer)
                .provenance(SourceClass.SIMULATED)
                .confidence(0.96)
                .cards(cards)
                .table(Map.of("headers", headers, "rows", rows))
                .actions(List.of(
                        Map.of("kind", "NAVIGATE", "label", "Open Scenario Studio", "path", "/scenarios"),
                        Map.of("kind", "NAVIGATE", "label", "Open Sustainability Dashboard", "path", "/sustainability")
                ))
                .because("Calculated via ScenarioSimulationService multi-scenario preview. Baseline figures represent current timetable allocations and formula base loads.")
                .build();
    }

    private static Optional<Map<String, Object>> findPreset(List<Map<String, Object>> presets, String id) {
        return presets.stream().filter(p -> id.equalsIgnoreCase(String.valueOf(p.get("id")))).findFirst();
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> toScenarioInput(String name, Map<String, Object> preset) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", name);
        if (preset.get("values") instanceof Map<?, ?> v) {
            map.putAll((Map<String, Object>) v);
        }
        return map;
    }

    private static void addMetricRow(List<List<Object>> rows, String label, String key, Map<String, Object> current, List<Map<String, Object>> scenarios) {
        List<Object> row = new ArrayList<>();
        row.add(label);
        row.add(formatVal(current, key));
        for (Map<String, Object> sc : scenarios) {
            @SuppressWarnings("unchecked")
            Map<String, Object> sim = (Map<String, Object>) sc.get("simulated");
            row.add(formatVal(sim, key));
        }
        rows.add(row);
    }

    private static String formatVal(Map<String, Object> map, String key) {
        if (map == null) return "N/A";
        Object obj = map.get(key);
        if (obj instanceof Map<?, ?> m) {
            Object val = m.get("value");
            Object unit = m.get("unit");
            return val != null ? (val + (unit != null ? " " + unit : "")) : "N/A";
        }
        return "N/A";
    }

    private static Object getVal(Map<String, Object> map, String key) {
        if (map == null) return "N/A";
        Object obj = map.get(key);
        if (obj instanceof Map<?, ?> m) {
            Object v = m.get("value");
            return v != null ? v : "N/A";
        }
        return "N/A";
    }
}
