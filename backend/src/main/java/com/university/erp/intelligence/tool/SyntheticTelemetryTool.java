package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.service.SyntheticTelemetryEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class SyntheticTelemetryTool implements CampusTool {

    private final SyntheticTelemetryEngine syntheticTelemetryEngine;

    @Override
    public String name() {
        return "get_synthetic_telemetry";
    }

    @Override
    public String description() {
        return "Retrieves deterministic synthetic telemetry time-series and building loads across simulated campus hours (power, crowd, transit, temperature, solar irradiance).";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        String query = params != null && params.get("query") != null ? String.valueOf(params.get("query")).toLowerCase(Locale.ROOT) : "";
        String scenarioId = "normal-day";
        if (query.contains("exam")) scenarioId = "exam-day";
        else if (query.contains("peak")) scenarioId = "peak-demand";
        else if (query.contains("energy") || query.contains("saving")) scenarioId = "energy-saving";
        else if (query.contains("closure") || query.contains("closed")) scenarioId = "building-closure";

        String metricType = "ENERGY";
        if (query.contains("crowd") || query.contains("congestion") || query.contains("corridor")) {
            metricType = "CROWD_DENSITY";
        } else if (query.contains("transit") || query.contains("bus") || query.contains("rider")) {
            metricType = "TRANSIT_PASSENGERS";
        } else if (query.contains("temp") || query.contains("weather") || query.contains("solar")) {
            metricType = "TEMPERATURE";
        }

        Map<String, Object> timeSeries = syntheticTelemetryEngine.generateTimeSeries(scenarioId, metricType, 8, 17, 60);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> points = (List<Map<String, Object>>) timeSeries.getOrDefault("points", List.of());

        List<String> headers = List.of("Hour (IST)", "Simulated Value", "Baseline Value", "Unit");
        List<List<Object>> rows = new ArrayList<>();
        double maxVal = 0;
        double minVal = Double.MAX_VALUE;
        String unit = "kW";

        for (Map<String, Object> pt : points) {
            String time = String.valueOf(pt.get("timestamp"));
            double val = pt.get("value") instanceof Number n ? n.doubleValue() : 0.0;
            double base = pt.get("baseline") instanceof Number n ? n.doubleValue() : 0.0;
            unit = String.valueOf(pt.getOrDefault("unit", "kW"));
            if (val > maxVal) maxVal = val;
            if (val < minVal) minVal = val;
            rows.add(List.of(time, val, base, unit));
        }

        List<Map<String, Object>> cards = List.of(
                Map.of("title", "Simulated Peak", "value", String.valueOf(maxVal), "unit", unit),
                Map.of("title", "Simulated Min", "value", String.valueOf(minVal == Double.MAX_VALUE ? 0 : minVal), "unit", unit),
                Map.of("title", "Active Scenario", "value", scenarioId.toUpperCase(Locale.ROOT))
        );

        String answer = String.format(
                "Synthetic Telemetry Stream (%s): Generated %d hourly points under scenario '%s'. Peak value is %.1f %s. " +
                "Telemetry provenance: Generated deterministically from scheduled timetable slot loads, diurnal ambient cycles, and scenario coefficients. " +
                "Notice: These readings are purely SYNTHETIC/SIMULATED; they are maintained separately from real physical IoT sensors and do not overwrite historical campus telemetry.",
                metricType, rows.size(), scenarioId, maxVal, unit
        );

        return ToolResult.builder()
                .toolName(name())
                .answer(answer)
                .provenance(SourceClass.SIMULATED)
                .confidence(0.95)
                .cards(cards)
                .table(Map.of("headers", headers, "rows", rows))
                .actions(List.of(
                        Map.of("kind", "NAVIGATE", "label", "Open Simulation Studio", "path", "/scenarios"),
                        Map.of("kind", "NAVIGATE", "label", "Open 3D Campus Map", "path", "/map")
                ))
                .because("Calculated deterministically via SyntheticTelemetryEngine. Readings follow physics and timetable scheduling formulas.")
                .build();
    }
}
