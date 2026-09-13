package com.university.erp.intelligence;

import java.util.LinkedHashMap;
import java.util.Map;

/** Simulation envelope. Callers still attach resultJson for older clients. */
public record SimulationResult(
        String scenario,
        SourceClass source,
        String because,
        Map<String, Object> outputs
) {
    public Map<String, Object> toBody() {
        Map<String, Object> body = new LinkedHashMap<>();
        if (outputs != null) {
            body.putAll(outputs);
        }
        if (scenario != null && !scenario.isBlank()) {
            body.putIfAbsent("scenario", scenario);
        }
        body.put("source", (source == null ? SourceClass.SIMULATED : source).name());
        if (because != null && !because.isBlank()) {
            body.putIfAbsent("because", because);
        }
        return body;
    }
}
