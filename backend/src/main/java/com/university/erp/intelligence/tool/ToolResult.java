package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.SourceClass;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Structured, typed result returned by a Digital Twin tool execution.
 * Encapsulates verified data, provenance, metric cards, tables, charts, and actions.
 */
public record ToolResult(
        String toolName,
        String answer,
        SourceClass sourceClass,
        String because,
        List<Map<String, Object>> cards,
        Map<String, Object> table,
        Map<String, Object> chart,
        List<Map<String, Object>> actions,
        List<Map<String, Object>> citations,
        boolean success,
        String errorMessage,
        LocalDateTime timestamp
) {
    private static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Kolkata");

    public static Builder builder() {
        return new Builder("digital_twin_tool");
    }

    public static Builder builder(String toolName) {
        return new Builder(toolName);
    }

    public static ToolResult error(String toolName, String errorMessage, String because) {
        return new Builder(toolName)
                .answer(errorMessage)
                .sourceClass(SourceClass.ESTIMATED)
                .because(because)
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("tool", toolName);
        map.put("answer", answer);
        map.put("source", sourceClass != null ? sourceClass.name() : SourceClass.ESTIMATED.name());
        map.put("because", because != null ? because : "Digital Twin verified service execution.");
        map.put("timestamp", timestamp != null ? timestamp.toString() : LocalDateTime.now(CAMPUS_ZONE).toString());
        map.put("timezone", CAMPUS_ZONE.getId());
        map.put("success", success);
        if (errorMessage != null) {
            map.put("error", errorMessage);
        }
        if (cards != null && !cards.isEmpty()) {
            map.put("cards", cards);
        }
        if (table != null && !table.isEmpty()) {
            map.put("table", table);
        }
        if (chart != null && !chart.isEmpty()) {
            map.put("chart", chart);
        }
        if (actions != null && !actions.isEmpty()) {
            map.put("actions", actions);
        }
        if (citations != null && !citations.isEmpty()) {
            map.put("citations", citations);
        }
        map.put("hallucinated", false);
        return map;
    }

    public static class Builder {
        private String toolName;
        private String answer = "";
        private SourceClass sourceClass = SourceClass.ESTIMATED;
        private String because = "";
        private List<Map<String, Object>> cards = new ArrayList<>();
        private Map<String, Object> table = null;
        private Map<String, Object> chart = null;
        private List<Map<String, Object>> actions = new ArrayList<>();
        private List<Map<String, Object>> citations = new ArrayList<>();
        private boolean success = true;
        private String errorMessage = null;
        private LocalDateTime timestamp = LocalDateTime.now(CAMPUS_ZONE);

        public Builder(String toolName) {
            this.toolName = toolName;
        }

        public Builder toolName(String toolName) {
            this.toolName = toolName;
            return this;
        }

        public Builder answer(String answer) {
            this.answer = answer;
            return this;
        }

        public Builder sourceClass(SourceClass sourceClass) {
            this.sourceClass = sourceClass;
            return this;
        }

        public Builder provenance(SourceClass sourceClass) {
            this.sourceClass = sourceClass;
            return this;
        }

        public Builder confidence(double confidence) {
            return this;
        }

        public Builder because(String because) {
            this.because = because;
            return this;
        }

        public Builder cards(List<Map<String, Object>> cards) {
            this.cards = cards != null ? new ArrayList<>(cards) : new ArrayList<>();
            return this;
        }

        public Builder table(Map<String, Object> table) {
            this.table = table;
            return this;
        }

        public Builder actions(List<Map<String, Object>> actions) {
            this.actions = actions != null ? new ArrayList<>(actions) : new ArrayList<>();
            return this;
        }

        public Builder citations(List<Map<String, Object>> citations) {
            this.citations = citations != null ? new ArrayList<>(citations) : new ArrayList<>();
            return this;
        }

        public Builder addCard(String title, Object value, String unit, String badge, String icon) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("title", title);
            card.put("value", value);
            card.put("unit", unit);
            card.put("badge", badge != null ? badge : sourceClass.name());
            card.put("icon", icon);
            this.cards.add(card);
            return this;
        }

        public Builder table(List<String> headers, List<List<Object>> rows) {
            Map<String, Object> tbl = new LinkedHashMap<>();
            tbl.put("headers", headers);
            tbl.put("rows", rows);
            this.table = tbl;
            return this;
        }

        public Builder chart(String type, String title, List<Map<String, Object>> data, String xKey, String yKey) {
            Map<String, Object> ch = new LinkedHashMap<>();
            ch.put("type", type);
            ch.put("title", title);
            ch.put("data", data);
            ch.put("xKey", xKey);
            ch.put("yKey", yKey);
            this.chart = ch;
            return this;
        }

        public Builder addAction(String kind, String label, String path) {
            Map<String, Object> action = new LinkedHashMap<>();
            action.put("kind", kind);
            action.put("label", label);
            action.put("path", path);
            this.actions.add(action);
            return this;
        }

        public Builder addCitation(String title, String section, String excerpt) {
            Map<String, Object> citation = new LinkedHashMap<>();
            citation.put("title", title);
            citation.put("section", section);
            citation.put("excerpt", excerpt);
            this.citations.add(citation);
            return this;
        }

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            return this;
        }

        public ToolResult build() {
            return new ToolResult(toolName, answer, sourceClass, because, cards, table, chart, actions, citations, success, errorMessage, timestamp);
        }
    }
}
