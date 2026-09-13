package com.university.erp.intelligence;

import com.university.erp.model.DigitalTwinMetrics;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CampusProvenanceTest {

    @Test
    void energyUsesStoredBaseAndClassTerm() {
        assertEquals(161.0, EnergyFormula.kw(new BigDecimal("150"), 2));
    }

    @Test
    void missingBaseLoadIsUnavailableEvenWhenClassesExist() {
        assertNull(EnergyFormula.kw(null, 4));
        assertNull(EnergyFormula.simulated(List.of(), 3, 1));
        assertNull(EnergyFormula.simulated(java.util.Arrays.asList(new BigDecimal[] { null }), 3, 1));
    }

    @Test
    void simulationEnergyStaysFormulaOnlyAndNullWithoutBase() {
        Double simulated = EnergyFormula.simulated(List.of(new BigDecimal("100")), 2, 0.5);
        assertEquals(105.5, simulated);
        assertNull(EnergyFormula.simulated(List.of(), 8, 1));
    }

    @Test
    void timetableEstimateIsNotPredictionHistory() {
        DigitalTwinMetrics estimate = DigitalTwinMetrics.builder()
                .metricType("CROWD_DENSITY")
                .value(0.9)
                .isSimulated(true)
                .sourceClass(SourceClass.ESTIMATED)
                .scenarioName(CrowdProvenance.TIMETABLE_ESTIMATE)
                .build();
        assertFalse(CrowdProvenance.isMeasuredHistory(estimate));
    }

    @Test
    void historicalCrowdSampleCountsAndEmptyDoesNot() {
        DigitalTwinMetrics measured = DigitalTwinMetrics.builder()
                .metricType("CROWD_DENSITY")
                .value(0.8)
                .isSimulated(false)
                .sourceClass(SourceClass.HISTORICAL)
                .build();
        assertTrue(CrowdProvenance.isMeasuredHistory(measured));
        assertFalse(CrowdProvenance.isMeasuredHistory(null));
    }

    @Test
    void problemKeysResolveOnlyNumericBuildingAndRoom() {
        ProblemKey valid = ProblemKey.parse("crowd:12:45");
        assertEquals(12, valid.buildingId());
        assertEquals(45, valid.roomId());
        assertEquals("infrastructure", ProblemKey.parse("infrastructure:12:45").type());
        assertNull(ProblemKey.parse("crowd:model:week"));
        assertNull(ProblemKey.parse("crowd:null:45"));
        assertNull(ProblemKey.of("crowd", null, 45));
    }
}
