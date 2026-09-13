package com.university.erp.intelligence;

import java.util.LinkedHashMap;
import java.util.Map;

public record AlertSignal(
        String priority,
        String category,
        String message,
        String suggestion,
        SourceClass source
) {
    public Map<String, String> toMap() {
        Map<String, String> out = new LinkedHashMap<>();
        if (priority != null) {
            out.put("priority", priority);
        }
        out.put("category", category == null ? "SYSTEM" : category);
        out.put("message", message == null ? "" : message);
        out.put("suggestion", suggestion == null ? "" : suggestion);
        out.put("source", (source == null ? SourceClass.ESTIMATED : source).name());
        return out;
    }
}
