package com.university.erp.intelligence;

import com.university.erp.model.DigitalTwinMetrics;

/**
 * Timetable estimates, simulations, and measured crowd history are different records.
 * A prediction may use only rows marked HISTORICAL.
 */
public final class CrowdProvenance {

    public static final String TIMETABLE_ESTIMATE = "TIMETABLE_ESTIMATE";

    private CrowdProvenance() {
    }

    public static boolean isMeasuredHistory(DigitalTwinMetrics sample) {
        if (sample == null || sample.getValue() == null) {
            return false;
        }
        if (sample.getSourceClass() != SourceClass.HISTORICAL) {
            return false;
        }
        if (Boolean.TRUE.equals(sample.getIsSimulated())) {
            return false;
        }
        String scenario = sample.getScenarioName();
        return scenario == null || scenario.isBlank();
    }
}
