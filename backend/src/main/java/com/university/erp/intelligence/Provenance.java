package com.university.erp.intelligence;

import java.util.LinkedHashMap;
import java.util.Map;

public final class Provenance {

    private Provenance() {
    }

    public static Map<String, Object> stamp(Map<String, Object> body, SourceClass source, String because) {
        Map<String, Object> out = body == null ? new LinkedHashMap<>() : new LinkedHashMap<>(body);
        out.putIfAbsent("source", source.name());
        if (because != null && !because.isBlank()) {
            out.putIfAbsent("because", because);
        }
        return out;
    }
}
