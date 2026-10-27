package com.university.erp.service;

import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.model.TimetableSlot;
import com.university.erp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ScenarioSimulationSweepTest {

    private ClassroomRepository classroomRepository;
    private BuildingRepository buildingRepository;
    private TimetableSlotRepository timetableSlotRepository;
    private CampusRecordQuery campusRecordQuery;
    private TransportRouteRepository transportRouteRepository;
    private DigitalTwinMetricsRepository metricsRepository;
    private ApplicationEventPublisher events;

    private ScenarioSimulationService service;

    @BeforeEach
    void setUp() {
        classroomRepository = Mockito.mock(ClassroomRepository.class);
        buildingRepository = Mockito.mock(BuildingRepository.class);
        timetableSlotRepository = Mockito.mock(TimetableSlotRepository.class);
        campusRecordQuery = Mockito.mock(CampusRecordQuery.class);
        transportRouteRepository = Mockito.mock(TransportRouteRepository.class);
        metricsRepository = Mockito.mock(DigitalTwinMetricsRepository.class);
        events = Mockito.mock(ApplicationEventPublisher.class);

        Building b = new Building();
        b.setId(1L);
        b.setName("Main Block");
        b.setBaseEnergyLoad(BigDecimal.valueOf(50.0));

        Classroom room = new Classroom();
        room.setId(101L);
        room.setName("Room 101");
        room.setBuilding(b);
        room.setCapacity(60);

        TimetableSlot slot = new TimetableSlot();
        slot.setId(1L);
        slot.setClassroom(room);
        slot.setDayOfWeek("MONDAY");
        slot.setStartTime("10:00");
        slot.setEndTime("11:00");
        slot.setSection("CSE-A");

        when(buildingRepository.findAll()).thenReturn(List.of(b));
        when(classroomRepository.findAll()).thenReturn(List.of(room));
        when(timetableSlotRepository.findAllWithClassroom()).thenReturn(List.of(slot));
        when(timetableSlotRepository.findByDayOfWeekIgnoreCase(Mockito.anyString())).thenReturn(List.of(slot));

        List<Object[]> sectionData = new ArrayList<>();
        sectionData.add(new Object[]{"CSE-A", 45L});
        when(campusRecordQuery.countStudentsBySection()).thenReturn(sectionData);
        when(transportRouteRepository.findAll()).thenReturn(List.of());

        service = new ScenarioSimulationService(
                classroomRepository,
                buildingRepository,
                timetableSlotRepository,
                campusRecordQuery,
                transportRouteRepository,
                metricsRepository,
                events
        );
    }

    @Test
    @DisplayName("catalog returns all 8 required standard preset scenarios")
    void testCatalogEightPresets() {
        Map<String, Object> catalog = service.catalog();
        assertNotNull(catalog);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> presets = (List<Map<String, Object>>) catalog.get("presets");
        assertNotNull(presets);

        List<String> expectedIds = List.of(
                "normal-day", "exam-day", "peak-demand", "classroom-demand-up",
                "energy-saving", "building-closure", "transport-electrification", "emergency-crowd"
        );

        for (String id : expectedIds) {
            assertTrue(presets.stream().anyMatch(p -> id.equalsIgnoreCase(String.valueOf(p.get("id")))),
                    "Preset missing: " + id);
        }
    }

    @Test
    @DisplayName("preview calculates multi-objective metrics including carbon emissions")
    void testPreviewMultiObjective() {
        Map<String, Object> req = Map.of("scenarios", List.of(
                Map.of("name", "Eco Mode", "hvacEfficiencyPercent", 30, "evAdoptionPercent", 50)
        ));

        Map<String, Object> result = service.preview(req);
        assertNotNull(result);
        assertEquals("SIMULATED", result.get("source"));

        @SuppressWarnings("unchecked")
        Map<String, Object> current = (Map<String, Object>) result.get("current");
        assertTrue(current.containsKey("carbonEmissions"));
        assertTrue(current.containsKey("energy"));
        assertTrue(current.containsKey("utilization"));
        assertTrue(current.containsKey("crowd"));
    }

    @Test
    @DisplayName("sweep evaluates parameter sweep points for trade-off curve")
    void testSweepTradeoffs() {
        Map<String, Object> sweepResult = service.sweep("hvacEfficiencyPercent", 0, 30, 10, Map.of());
        assertNotNull(sweepResult);
        assertEquals("SIMULATED", sweepResult.get("source"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> points = (List<Map<String, Object>>) sweepResult.get("points");
        assertNotNull(points);
        assertEquals(4, points.size()); // 0, 10, 20, 30

        for (Map<String, Object> pt : points) {
            assertTrue(pt.containsKey("parameterValue"));
            assertTrue(pt.containsKey("energy"));
            assertTrue(pt.containsKey("carbonEmissions"));
        }
    }

    @Test
    @DisplayName("history returns recent stored scenario runs")
    void testHistory() {
        DigitalTwinMetrics m = DigitalTwinMetrics.builder()
                .id(99L)
                .scenarioName("Examination Day Test")
                .metricType("SCENARIO_RUN")
                .timestamp(LocalDateTime.now())
                .isSimulated(true)
                .build();

        when(metricsRepository.findTop50ByMetricTypeOrderByTimestampDesc("SCENARIO_RUN"))
                .thenReturn(List.of(m));

        List<Map<String, Object>> hist = service.history();
        assertEquals(1, hist.size());
        assertEquals("Examination Day Test", hist.get(0).get("scenarioName"));
    }
}
