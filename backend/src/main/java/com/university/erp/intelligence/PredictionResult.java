package com.university.erp.intelligence;

import java.util.LinkedHashMap;
import java.util.Map;

/** Prediction contract. Extra keys keep existing API fields stable. */
public record PredictionResult(
        String metric,
        Double confidence,
        String trend,
        String suggestedAction,
        String because,
        SourceClass source
) {
    public Map<String, Object> merge(Map<String, Object> existingKeys) {
        Map<String, Object> out = new LinkedHashMap<>();
        if (existingKeys != null) {
            out.putAll(existingKeys);
        }
        if (metric != null) {
            out.putIfAbsent("metric", metric);
        }
        if (confidence != null) {
            out.putIfAbsent("confidence", confidence);
            out.putIfAbsent("confidenceScore", confidence);
        }
        if (trend != null) {
            out.putIfAbsent("trend", trend);
        }
        if (suggestedAction != null) {
            out.putIfAbsent("suggestedAction", suggestedAction);
        }
        out.putIfAbsent("source", (source == null ? SourceClass.PREDICTED : source).name());
        if (because != null && !because.isBlank()) {
            out.putIfAbsent("because", because);
        }
        return out;
    }
}
