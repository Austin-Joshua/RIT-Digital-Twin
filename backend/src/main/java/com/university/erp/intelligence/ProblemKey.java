package com.university.erp.intelligence;

/**
 * Operational problem identity. Only crowd and infrastructure keys with positive
 * numeric building and room ids resolve to a campus entity. Model keys do not.
 */
public record ProblemKey(String type, long buildingId, long roomId) {

    public static ProblemKey parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String[] parts = raw.split(":", -1);
        if (parts.length != 3) {
            return null;
        }
        if (!"crowd".equals(parts[0]) && !"infrastructure".equals(parts[0])) {
            return null;
        }
        Long buildingId = positive(parts[1]);
        Long roomId = positive(parts[2]);
        if (buildingId == null || roomId == null) {
            return null;
        }
        return new ProblemKey(parts[0], buildingId, roomId);
    }

    public static String of(String type, Object buildingId, Object roomId) {
        ProblemKey key = parse(type + ":" + buildingId + ":" + roomId);
        return key == null ? null : key.text();
    }

    public String text() {
        return type + ":" + buildingId + ":" + roomId;
    }

    private static Long positive(String raw) {
        if (raw == null || !raw.chars().allMatch(Character::isDigit) || raw.isEmpty()) {
            return null;
        }
        try {
            long value = Long.parseLong(raw);
            return value > 0 ? value : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
