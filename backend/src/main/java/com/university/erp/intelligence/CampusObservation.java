package com.university.erp.intelligence;

/**
 * One reading of campus state. Scope is the twin hierarchy
 * (CAMPUS, BUILDING, FLOOR, ROOM, ASSET), not a second physical model.
 */
public record CampusObservation(
        String scope,
        String locationCode,
        String metric,
        Double value,
        String unit,
        SourceClass source,
        String because
) {
    public CampusObservation {
        if (source == null) {
            source = SourceClass.ESTIMATED;
        }
        if (scope == null || scope.isBlank()) {
            scope = "CAMPUS";
        }
    }
}
