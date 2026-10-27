package com.university.erp.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class CampusMissionServiceTest {

    private ScenarioSimulationService scenarioSimulationService;
    private CampusMissionService missionService;

    @BeforeEach
    void setUp() {
        scenarioSimulationService = Mockito.mock(ScenarioSimulationService.class);
        missionService = new CampusMissionService(scenarioSimulationService);
    }

    @Test
    @DisplayName("getMissions returns all 4 operational missions")
    void testGetMissions() {
        List<CampusMissionService.MissionDef> list = missionService.getMissions();
        assertEquals(4, list.size());
        assertTrue(list.stream().anyMatch(m -> m.id().equals("energy-reduction")));
        assertTrue(list.stream().anyMatch(m -> m.id().equals("utilization-boost")));
        assertTrue(list.stream().anyMatch(m -> m.id().equals("bottleneck-elimination")));
        assertTrue(list.stream().anyMatch(m -> m.id().equals("fleet-electrification")));
    }

    @Test
    @DisplayName("evaluateMission awards GOLD badge when targets and constraints pass")
    void testEvaluateMissionGold() {
        Map<String, Object> previewMock = Map.of(
                "current", Map.of(
                        "energy", Map.of("value", 300.0),
                        "carbonEmissions", Map.of("value", 2000.0)
                ),
                "scenarios", List.of(
                        Map.of(
                                "simulated", Map.of(
                                        "energy", Map.of("value", 240.0), // 20% cut
                                        "resourceDemand", Map.of("value", 0.0),
                                        "utilization", Map.of("value", 45.0)
                                ),
                                "deltas", Map.of(
                                        "energy", -60.0
                                )
                        )
                )
        );

        when(scenarioSimulationService.preview(any())).thenReturn(previewMock);

        Map<String, Object> result = missionService.evaluateMission("energy-reduction", Map.of("hvacEfficiencyPercent", 25));
        assertNotNull(result);
        assertTrue((Boolean) result.get("passed"));
        int score = ((Number) result.get("score")).intValue();
        assertTrue(score >= 90, "Score should be >= 90 for gold badge, got: " + score);
        assertEquals("GOLD", result.get("badge"));
        assertEquals("SIMULATED", result.get("provenance"));
    }

    @Test
    @DisplayName("evaluateMission applies penalty when constraint is violated")
    void testEvaluateMissionConstraintPenalty() {
        Map<String, Object> previewMock = Map.of(
                "current", Map.of(
                        "energy", Map.of("value", 300.0),
                        "carbonEmissions", Map.of("value", 2000.0)
                ),
                "scenarios", List.of(
                        Map.of(
                                "simulated", Map.of(
                                        "energy", Map.of("value", 220.0),
                                        "resourceDemand", Map.of("value", 50.0), // Constraint violated!
                                        "utilization", Map.of("value", 30.0)
                                ),
                                "deltas", Map.of(
                                        "energy", -80.0
                                )
                        )
                )
        );

        when(scenarioSimulationService.preview(any())).thenReturn(previewMock);

        Map<String, Object> result = missionService.evaluateMission("energy-reduction", Map.of("hvacEfficiencyPercent", 35));
        assertNotNull(result);
        assertFalse((Boolean) result.get("constraintsPassed"));
        assertFalse((Boolean) result.get("passed"));
    }
}
