package com.university.erp.service;

import com.university.erp.model.Building;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.CampusRecordQuery;
import com.university.erp.repository.ClassroomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class SyntheticTelemetryEngineTest {

    private BuildingRepository buildingRepository;
    private ClassroomRepository classroomRepository;
    private CampusRecordQuery campusRecordQuery;

    private SyntheticTelemetryEngine engine;

    @BeforeEach
    void setUp() {
        buildingRepository = Mockito.mock(BuildingRepository.class);
        classroomRepository = Mockito.mock(ClassroomRepository.class);
        campusRecordQuery = Mockito.mock(CampusRecordQuery.class);

        Building b1 = new Building();
        b1.setId(1L);
        b1.setName("Main Block");
        b1.setBaseEnergyLoad(BigDecimal.valueOf(45.0));

        Building b2 = new Building();
        b2.setId(2L);
        b2.setName("CS Block");
        b2.setBaseEnergyLoad(BigDecimal.valueOf(35.0));

        when(buildingRepository.findAll()).thenReturn(List.of(b1, b2));
        List<Object[]> sectionData = new java.util.ArrayList<>();
        sectionData.add(new Object[]{"SEC-A", 60L});
        when(campusRecordQuery.countStudentsBySection()).thenReturn(sectionData);

        engine = new SyntheticTelemetryEngine(
                buildingRepository,
                classroomRepository,
                campusRecordQuery
        );
    }

    @Test
    @DisplayName("generateTimeSeries produces reproducible points with SYNTHETIC provenance")
    void testGenerateTimeSeries() {
        Map<String, Object> series = engine.generateTimeSeries("normal-day", "ENERGY", 9, 12, 30);
        assertNotNull(series);
        assertEquals("SYNTHETIC", series.get("provenance"));
        assertEquals("SIMULATED", series.get("source"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> points = (List<Map<String, Object>>) series.get("points");
        assertNotNull(points);
        assertFalse(points.isEmpty());

        Map<String, Object> first = points.get(0);
        assertTrue(first.containsKey("timestamp"));
        assertTrue(first.containsKey("value"));
        assertTrue(first.containsKey("baseline"));
        assertTrue(((Number) first.get("value")).doubleValue() > 0);
    }

    @Test
    @DisplayName("getCampusOverview generates per-building telemetry with active status")
    void testGetCampusOverview() {
        Map<String, Object> overview = engine.getCampusOverview("normal-day", LocalTime.of(10, 30));
        assertNotNull(overview);
        assertEquals("SYNTHETIC", overview.get("provenance"));

        @SuppressWarnings("unchecked")
        Map<String, Object> buildings = (Map<String, Object>) overview.get("buildings");
        assertNotNull(buildings);
        assertTrue(buildings.containsKey("Main Block"));

        @SuppressWarnings("unchecked")
        Map<String, Object> mainBlockData = (Map<String, Object>) buildings.get("Main Block");
        assertEquals("OPERATIONAL", mainBlockData.get("status"));
        assertTrue(((Number) mainBlockData.get("power")).doubleValue() >= 45.0);
    }

    @Test
    @DisplayName("Building closure scenario marks closed wings as MAINTENANCE_CLOSED with zero class power")
    void testBuildingClosureScenario() {
        Building mech = new Building();
        mech.setId(3L);
        mech.setName("Mechanical Block");
        mech.setBaseEnergyLoad(BigDecimal.valueOf(40.0));

        when(buildingRepository.findAll()).thenReturn(List.of(mech));

        Map<String, Object> overview = engine.getCampusOverview("building-closure", LocalTime.of(11, 0));
        @SuppressWarnings("unchecked")
        Map<String, Object> buildings = (Map<String, Object>) overview.get("buildings");
        @SuppressWarnings("unchecked")
        Map<String, Object> mechData = (Map<String, Object>) buildings.get("Mechanical Block");

        assertEquals("MAINTENANCE_CLOSED", mechData.get("status"));
        assertEquals(0.0, ((Number) mechData.get("occupancy")).doubleValue());
    }
}
