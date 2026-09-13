package com.university.erp.intelligence;

public record Recommendation(
        String action,
        String reason,
        String expectedImpact,
        SourceClass source
) {
    public String actionOrFallback(String fallback) {
        return action == null || action.isBlank() ? fallback : action;
    }
}
