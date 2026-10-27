package com.university.erp.intelligence.tool;

import java.util.List;
import java.util.Map;

/**
 * Contract for all Digital Twin operational tools.
 * Keeps data retrieval and business logic outside the LLM.
 */
public interface CampusTool {

    /**
     * Unique identifier for the tool (e.g. get_campus_overview, get_room_utilization).
     */
    String name();

    /**
     * Natural language description of what the tool does and what inputs it accepts.
     */
    String description();

    /**
     * Institutional roles authorized to invoke this tool (e.g. ADMIN, HOD, FACULTY, STUDENT, PARENT).
     */
    List<String> requiredRoles();

    /**
     * Executes the tool using typed backend queries, enforcing limits and provenance stamps.
     */
    ToolResult execute(Map<String, Object> params, String userRole);

    /**
     * Evaluates whether the given user role is authorized to execute this tool.
     */
    default boolean isAuthorized(String userRole) {
        if (userRole == null || userRole.isBlank()) {
            return false;
        }
        String normalized = userRole.replace("ROLE_", "").toUpperCase();
        return requiredRoles().contains(normalized);
    }
}
