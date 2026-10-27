package com.university.erp.intelligence.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Central registry and execution coordinator for all Digital Twin operational tools.
 * Handles permission-checking, parameter validation, timeout safety, and observability tracking.
 */
@Service
@Slf4j
public class CampusToolRegistry {

    private final Map<String, CampusTool> tools = new ConcurrentHashMap<>();

    public CampusToolRegistry(List<CampusTool> availableTools) {
        if (availableTools != null) {
            for (CampusTool tool : availableTools) {
                tools.put(tool.name().toLowerCase(Locale.ROOT), tool);
                log.info("Registered Digital Twin Tool: [{}] - {}", tool.name(), tool.description());
            }
        }
    }

    public Optional<CampusTool> getTool(String toolName) {
        if (toolName == null) return Optional.empty();
        return Optional.ofNullable(tools.get(toolName.trim().toLowerCase(Locale.ROOT)));
    }

    public List<Map<String, Object>> getToolsForRole(String userRole) {
        String normalizedRole = userRole == null ? "" : userRole.replace("ROLE_", "").toUpperCase();
        List<Map<String, Object>> result = new ArrayList<>();
        for (CampusTool tool : tools.values()) {
            if (tool.isAuthorized(normalizedRole)) {
                result.add(Map.of(
                        "name", tool.name(),
                        "description", tool.description(),
                        "roles", tool.requiredRoles()
                ));
            }
        }
        return result;
    }

    public ToolResult execute(String toolName, Map<String, Object> params, String userRole) {
        long startTime = System.currentTimeMillis();
        String normalizedRole = userRole == null ? "" : userRole.replace("ROLE_", "").toUpperCase();
        Optional<CampusTool> toolOpt = getTool(toolName);

        if (toolOpt.isEmpty()) {
            log.warn("Tool [{}] not found in registry", toolName);
            return ToolResult.error(toolName != null ? toolName : "unknown",
                    "Requested tool is not recognized in the Digital Twin tool registry.",
                    "Tool registry lookup failed.");
        }

        CampusTool tool = toolOpt.get();

        if (!tool.isAuthorized(normalizedRole)) {
            log.warn("Access denied for role [{}] invoking tool [{}]", normalizedRole, tool.name());
            return ToolResult.error(tool.name(),
                    String.format("Access Denied: The role '%s' is not authorized to execute digital twin tool '%s'.", normalizedRole, tool.name()),
                    "Backend Role-Based Access Control (RBAC) constraint.");
        }

        try {
            ToolResult result = tool.execute(params, normalizedRole);
            long elapsed = System.currentTimeMillis() - startTime;
            log.info("Successfully executed tool [{}] for role [{}] in {}ms", tool.name(), normalizedRole, elapsed);
            return result;
        } catch (Exception ex) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("Error executing tool [{}] after {}ms: {}", tool.name(), elapsed, ex.getMessage(), ex);
            return ToolResult.error(tool.name(),
                    "Execution error encountered while retrieving digital twin metrics: " + ex.getMessage(),
                    "Backend tool execution failure.");
        }
    }

    /**
     * Maps user intent and natural language query to the appropriate Digital Twin Tool.
     * Returns tool name or null if generic intent.
     */
    public String routeQueryToTool(String query) {
        if (query == null || query.isBlank()) {
            return "get_campus_overview";
        }
        String lower = query.toLowerCase(Locale.ROOT);

        // 1. Space Utilization & lowest utilized rooms
        if ((lower.contains("lowest") || lower.contains("least") || lower.contains("underutiliz") || lower.contains("utilization") || lower.contains("unutilized") || lower.contains("rebalanc"))
                && (lower.contains("room") || lower.contains("classroom") || lower.contains("space") || lower.contains("allocation"))) {
            return "get_room_utilization";
        }

        // 2. Room Occupancy & Free / Available Rooms
        if ((lower.contains("available") || lower.contains("free") || lower.contains("vacant") || lower.contains("occupan") || lower.contains("empty"))
                && (lower.contains("room") || lower.contains("classroom") || lower.contains("seat") || lower.contains("hall"))) {
            return "get_room_occupancy";
        }

        // 3. Scenario Comparison & Trade-offs
        if (lower.contains("which tested scenario") || lower.contains("reduces energy") || lower.contains("trade-off") || lower.contains("tradeoff")
                || ((lower.contains("compare") || lower.contains("versus") || lower.contains("vs") || lower.contains("best scenario"))
                && (lower.contains("scenario") || lower.contains("normal") || lower.contains("exam") || lower.contains("day") || lower.contains("fleet") || lower.contains("preset") || lower.contains("demand") || lower.contains("option") || lower.contains("transport")))) {
            return "compare_scenarios";
        }

        // 4. Mission Mode & Challenges
        if (lower.contains("mission") || lower.contains("challenge") || lower.contains("goal score") || lower.contains("evaluate proposal")) {
            return "evaluate_mission";
        }

        // 5. Synthetic Telemetry & Clock Scrub
        if (lower.contains("synthetic") || lower.contains("telemetry stream") || lower.contains("simulated clock") || lower.contains("playback") || lower.contains("solar irradiance")) {
            return "get_synthetic_telemetry";
        }

        // 6. What-if Scenario & Single Simulation
        if (lower.contains("what if") || lower.contains("what-if") || lower.contains("simulate") || lower.contains("intake") || lower.contains("new block")) {
            return "run_campus_simulation";
        }

        // 7. Energy Anomaly Detection
        if (lower.contains("anomaly report") || ((lower.contains("anomaly") || lower.contains("unusual") || lower.contains("spike") || lower.contains("abnormal") || lower.contains("unexpected") || lower.contains("deviat"))
                && (lower.contains("energy") || lower.contains("power") || lower.contains("consumption") || lower.contains("load") || lower.contains("usage") || lower.contains("report") || lower.contains("admin")))) {
            return "detect_energy_anomalies";
        }

        // 8. Energy Consumption & Metrics
        if (lower.contains("energy") || lower.contains("power") || lower.contains("kw") || lower.contains("electricity") || lower.contains("hvac load")) {
            return "get_energy_metrics";
        }

        // 9. Crowd Flow & Congestion
        if (lower.contains("crowd") || lower.contains("congestion") || lower.contains("corridor") || lower.contains("entrance") || lower.contains("stairwell") || lower.contains("foot traffic")) {
            return "get_crowd_simulation_results";
        }

        // 10. Transport, Fleet, Bus Routes
        if (lower.contains("transport") || lower.contains("bus") || lower.contains("route") || lower.contains("fleet") || lower.contains("ev scenario") || lower.contains("transit")) {
            return "get_transport_metrics";
        }

        // 11. ESG & Sustainability
        if (lower.contains("esg") || lower.contains("sustainab") || lower.contains("carbon") || lower.contains("green") || lower.contains("solar yield") || lower.contains("co2") || lower.contains("emission") || lower.contains("water") || lower.contains("waste")) {
            return "get_esg_metrics";
        }

        // 12. Historical Comparison & Trends
        if ((lower.contains("historical") || lower.contains("history") || lower.contains("trend") || lower.contains("last week") || lower.contains("past readings") || lower.contains("compare"))
                && !lower.contains("scenario")) {
            return "get_historical_trends";
        }

        // 13. Operational Report & Summary
        if (lower.contains("report") || lower.contains("summary") || lower.contains("executive brief") || lower.contains("audit report")) {
            return "generate_operational_report";
        }

        // 14. Building Geometry & 3D Geospatial Status
        if (lower.contains("geometry") || lower.contains("footprint") || lower.contains("verified building")
                || lower.contains("height of") || lower.contains("source of this building") || lower.contains("which building is selected")
                || lower.contains("building verification") || lower.contains("osm") || lower.contains("geographic")
                || lower.contains("3d map") || lower.contains("building coordinates")) {
            return "get_campus_building_geometry";
        }

        // 15. Campus Overview / What's happening
        if (lower.contains("overview") || lower.contains("what is happening") || lower.contains("campus state") || lower.contains("briefing") || lower.contains("status")) {
            return "get_campus_overview";
        }

        return null;
    }
}
