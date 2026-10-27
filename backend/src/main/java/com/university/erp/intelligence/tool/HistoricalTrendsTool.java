package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.repository.DigitalTwinMetricsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class HistoricalTrendsTool implements CampusTool {

    private final DigitalTwinMetricsRepository metricsRepository;

    @Override
    public String name() {
        return "get_historical_trends";
    }

    @Override
    public String description() {
        return "Retrieves and compares recorded historical measurements and time-series rollups for energy, crowd density, or space utilization.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        String metricType = params != null && params.get("metricType") != null
                ? String.valueOf(params.get("metricType")).toUpperCase(Locale.ROOT)
                : "ENERGY_DEMAND";

        List<DigitalTwinMetrics> samples = metricsRepository.findTop50ByMetricTypeOrderByTimestampDesc(metricType).stream()
                .filter(s -> s.getValue() != null)
                .toList();

        if (samples.isEmpty()) {
            return ToolResult.builder(name())
                    .answer(String.format("No historical records are stored for metric type '%s'. Stored telemetry series does not contain past readings for this key. No synthetic history is fabricated.", metricType))
                    .sourceClass(SourceClass.HISTORICAL)
                    .because("Query to digital_twin_metrics returned 0 rows.")
                    .addCard("Recorded Samples", 0, "rows", "UNAVAILABLE", "database")
                    .build();
        }

        double sum = 0.0;
        double min = Double.MAX_VALUE;
        double max = Double.MIN_VALUE;
        List<List<Object>> tableRows = new ArrayList<>();
        List<Map<String, Object>> chartData = new ArrayList<>();

        for (int i = 0; i < Math.min(10, samples.size()); i++) {
            DigitalTwinMetrics s = samples.get(i);
            double v = s.getValue();
            sum += v;
            if (v < min) min = v;
            if (v > max) max = v;

            String timeStr = s.getTimestamp() != null ? s.getTimestamp().toString().replace("T", " ") : "N/A";
            tableRows.add(List.of(
                    timeStr,
                    s.getLocationCode() != null ? s.getLocationCode() : "CAMPUS",
                    Math.round(v * 10.0) / 10.0 + " " + (s.getUnit() != null ? s.getUnit() : ""),
                    s.getSourceClass() != null ? s.getSourceClass().name() : "HISTORICAL",
                    s.getScenarioName() != null ? s.getScenarioName() : "RECORDED"
            ));

            chartData.add(Map.of(
                    "timestamp", timeStr.length() > 16 ? timeStr.substring(11, 16) : timeStr,
                    "value", Math.round(v * 10.0) / 10.0
            ));
        }

        double avg = Math.round((sum / Math.min(10, samples.size())) * 10.0) / 10.0;
        double latest = samples.get(0).getValue();
        double deltaFromAvg = Math.round((latest - avg) * 10.0) / 10.0;

        String answer = String.format(
                "Historical Trend Analysis for '%s' (%d total recorded samples): Latest recorded reading is %.1f %s (Historical 10-sample Average: %.1f %s, Min: %.1f, Max: %.1f). Current reading is %s%.1f %s relative to the historical average. All samples represent recorded historical database rows.",
                metricType, samples.size(), latest, samples.get(0).getUnit() != null ? samples.get(0).getUnit() : "",
                avg, samples.get(0).getUnit() != null ? samples.get(0).getUnit() : "", min, max,
                deltaFromAvg >= 0 ? "+" : "", deltaFromAvg, samples.get(0).getUnit() != null ? samples.get(0).getUnit() : ""
        );

        return ToolResult.builder(name())
                .answer(answer)
                .sourceClass(SourceClass.HISTORICAL)
                .because("Retrieved directly from historical rows stored in the digital_twin_metrics database table.")
                .addCard("Latest Reading", latest, samples.get(0).getUnit() != null ? samples.get(0).getUnit() : "", "HISTORICAL", "clock")
                .addCard("Historical Average", avg, samples.get(0).getUnit() != null ? samples.get(0).getUnit() : "", "HISTORICAL", "trending-up")
                .addCard("Historical Min", min, samples.get(0).getUnit() != null ? samples.get(0).getUnit() : "", "HISTORICAL", "arrow-down")
                .addCard("Historical Max", max, samples.get(0).getUnit() != null ? samples.get(0).getUnit() : "", "HISTORICAL", "arrow-up")
                .table(List.of("Timestamp", "Location", "Value", "Provenance", "Scenario / Tag"), tableRows)
                .chart("line", metricType + " Historical Series", chartData, "timestamp", "value")
                .addAction("VIEW", "Open Analytics", "/analytics")
                .addCitation("RIT Digital Twin Architecture Standard, §6.0", "§6.0", "HISTORICAL tag indicates verified persisted measurements.")
                .build();
    }
}
