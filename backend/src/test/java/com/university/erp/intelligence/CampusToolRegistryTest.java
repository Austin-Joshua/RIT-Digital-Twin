package com.university.erp.intelligence;

import com.university.erp.intelligence.tool.*;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.model.TimetableSlot;
import com.university.erp.model.TransportRoute;
import com.university.erp.repository.*;
import com.university.erp.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class CampusToolRegistryTest {

    private BuildingRepository buildingRepository;
    private ClassroomRepository classroomRepository;
    private TimetableSlotRepository timetableSlotRepository;
    private DigitalTwinMetricsRepository metricsRepository;
    private CampusRecordQuery campusRecordQuery;
    private CampusStateService campusStateService;
    private ScenarioSimulationService scenarioSimulationService;
    private TransportRouteRepository transportRouteRepository;
    private BusStopRepository busStopRepository;
    private StudentTransportRepository studentTransportRepository;
    private AiService aiService;
    private CrowdFlowService crowdFlowService;
    private PredictiveEngine predictiveEngine;

    private CampusToolRegistry registry;

    @BeforeEach
    void setUp() {
        buildingRepository = Mockito.mock(BuildingRepository.class);
        classroomRepository = Mockito.mock(ClassroomRepository.class);
        timetableSlotRepository = Mockito.mock(TimetableSlotRepository.class);
        metricsRepository = Mockito.mock(DigitalTwinMetricsRepository.class);
        campusRecordQuery = Mockito.mock(CampusRecordQuery.class);
        campusStateService = Mockito.mock(CampusStateService.class);
        scenarioSimulationService = Mockito.mock(ScenarioSimulationService.class);
        transportRouteRepository = Mockito.mock(TransportRouteRepository.class);
        busStopRepository = Mockito.mock(BusStopRepository.class);
        studentTransportRepository = Mockito.mock(StudentTransportRepository.class);
        aiService = Mockito.mock(AiService.class);
        crowdFlowService = Mockito.mock(CrowdFlowService.class);
        predictiveEngine = Mockito.mock(PredictiveEngine.class);

        Building mainBlock = new Building();
        mainBlock.setId(1L);
        mainBlock.setName("Main Block");
        mainBlock.setCode("MB");
        mainBlock.setBaseEnergyLoad(BigDecimal.valueOf(120.0));

        Classroom room101 = new Classroom();
        room101.setId(101L);
        room101.setName("Room 101");
        room101.setBuilding(mainBlock);
        room101.setCapacity(60);

        TimetableSlot slot = new TimetableSlot();
        slot.setId(1001L);
        slot.setClassroom(room101);
        slot.setDayOfWeek("MONDAY");
        slot.setStartTime("09:00");
        slot.setEndTime("17:00");
        slot.setSection("CSE-A");

        when(buildingRepository.findAll()).thenReturn(List.of(mainBlock));
        when(classroomRepository.findAll()).thenReturn(List.of(room101));
        when(classroomRepository.findAllWithBuilding()).thenReturn(List.of(room101));
        when(timetableSlotRepository.findAllWithClassroom()).thenReturn(List.of(slot));
        when(timetableSlotRepository.findByDayOfWeekIgnoreCase(anyString())).thenReturn(List.of(slot));
        List<Object[]> sectionData = new ArrayList<>();
        sectionData.add(new Object[]{"CSE-A", 48L});
        when(campusRecordQuery.countStudentsBySection()).thenReturn(sectionData);
        when(campusStateService.current()).thenReturn(Map.of("alertCenter", Map.of("alerts", List.of())));

        SyntheticTelemetryEngine syntheticTelemetryEngine = Mockito.mock(SyntheticTelemetryEngine.class);
        CampusMissionService campusMissionService = Mockito.mock(CampusMissionService.class);

        List<CampusTool> tools = List.of(
                new CampusOverviewTool(buildingRepository, classroomRepository, timetableSlotRepository, campusStateService),
                new RoomOccupancyTool(classroomRepository, timetableSlotRepository, campusRecordQuery),
                new RoomUtilizationTool(classroomRepository, timetableSlotRepository),
                new EnergyMetricsTool(buildingRepository, timetableSlotRepository, metricsRepository),
                new EnergyAnomalyTool(buildingRepository, timetableSlotRepository),
                new TransportMetricsTool(transportRouteRepository, busStopRepository, studentTransportRepository, aiService),
                new CrowdSimulationTool(crowdFlowService, predictiveEngine),
                new CampusSimulationTool(scenarioSimulationService),
                new EsgMetricsTool(buildingRepository, transportRouteRepository),
                new HistoricalTrendsTool(metricsRepository),
                new OperationalReportTool(buildingRepository, classroomRepository, timetableSlotRepository, transportRouteRepository),
                new CompareScenariosTool(scenarioSimulationService),
                new SyntheticTelemetryTool(syntheticTelemetryEngine),
                new MissionEvaluationTool(campusMissionService),
                new CampusBuildingGeometryTool(buildingRepository, classroomRepository, timetableSlotRepository)
        );

        registry = new CampusToolRegistry(tools);
    }

    @Test
    @DisplayName("Registry discovers all core digital twin operational tools including real geometry tool")
    void registryDiscoversAllTools() {
        assertTrue(registry.getTool("get_campus_overview").isPresent());
        assertTrue(registry.getTool("get_room_occupancy").isPresent());
        assertTrue(registry.getTool("get_room_utilization").isPresent());
        assertTrue(registry.getTool("get_energy_metrics").isPresent());
        assertTrue(registry.getTool("detect_energy_anomalies").isPresent());
        assertTrue(registry.getTool("get_transport_metrics").isPresent());
        assertTrue(registry.getTool("get_crowd_simulation_results").isPresent());
        assertTrue(registry.getTool("run_campus_simulation").isPresent());
        assertTrue(registry.getTool("get_esg_metrics").isPresent());
        assertTrue(registry.getTool("get_historical_trends").isPresent());
        assertTrue(registry.getTool("generate_operational_report").isPresent());
        assertTrue(registry.getTool("compare_scenarios").isPresent());
        assertTrue(registry.getTool("get_synthetic_telemetry").isPresent());
        assertTrue(registry.getTool("evaluate_mission").isPresent());
        assertTrue(registry.getTool("get_campus_building_geometry").isPresent());
    }

    @Test
    @DisplayName("Role-based access control enforces tool permissions and denies unauthorized access")
    void roleBasedAccessControlEnforced() {
        // ADMIN can run simulation
        ToolResult adminSim = registry.execute("run_campus_simulation", Map.of("intakePercent", 20), "ADMIN");
        assertTrue(adminSim.success());

        // STUDENT cannot run simulation
        ToolResult studentSim = registry.execute("run_campus_simulation", Map.of("intakePercent", 20), "STUDENT");
        assertFalse(studentSim.success());
        assertTrue(studentSim.errorMessage().contains("Access Denied"));

        // STUDENT can get campus overview
        ToolResult studentOverview = registry.execute("get_campus_overview", Map.of(), "STUDENT");
        assertTrue(studentOverview.success());
    }

    @Test
    @DisplayName("Room utilization tool identifies underutilized rooms with ESTIMATED provenance")
    void roomUtilizationIdentifiesUnderutilized() {
        ToolResult result = registry.execute("get_room_utilization", Map.of(), "FACULTY");

        assertTrue(result.success());
        assertEquals(SourceClass.ESTIMATED, result.sourceClass());
        assertNotNull(result.table());
        assertTrue(result.answer().contains("Underutilized") || result.answer().contains("UNDERUTILIZED"));
        assertFalse(result.cards().isEmpty());
    }

    @Test
    @DisplayName("Energy metrics tool uses formula base load + 5.5 kW without claiming live meter")
    void energyMetricsUsesFormulaAndDisclaimsMeter() {
        ToolResult result = registry.execute("get_energy_metrics", Map.of(), "ADMIN");

        assertTrue(result.success());
        assertEquals(SourceClass.SIMULATED, result.sourceClass());
        assertTrue(result.answer().contains("kW"));
        assertTrue(result.answer().contains("No physical hardware power meters are connected"));
        assertNotNull(result.table());
    }

    @Test
    @DisplayName("Energy anomaly tool flags statistical variations and distinguishes from physical faults")
    void energyAnomalyToolFlagsStatisticalVariation() {
        ToolResult result = registry.execute("detect_energy_anomalies", Map.of(), "ADMIN");

        assertTrue(result.success());
        assertEquals(SourceClass.ESTIMATED, result.sourceClass());
        assertTrue(result.answer().contains("statistical"));
        assertNotNull(result.table());
    }

    @Test
    @DisplayName("ESG metrics tool reports net carbon and explicitly marks waste/water ledgers unavailable")
    void esgMetricsToolHonestReporting() {
        ToolResult result = registry.execute("get_esg_metrics", Map.of(), "ADMIN");

        assertTrue(result.success());
        assertEquals(SourceClass.ESTIMATED, result.sourceClass());
        assertTrue(result.answer().contains("ESG Sustainability Rating"));
        assertTrue(result.answer().contains("UNAVAILABLE"));
        assertNotNull(result.table());
    }

    @Test
    @DisplayName("Intelligent query router maps user questions to correct digital twin tools")
    void intelligentQueryRouting() {
        assertEquals("get_room_utilization", registry.routeQueryToTool("Which classrooms have the lowest utilization today?"));
        assertEquals("get_energy_metrics", registry.routeQueryToTool("Explain the campus energy consumption trend"));
        assertEquals("detect_energy_anomalies", registry.routeQueryToTool("Which buildings show unusual energy usage or anomalies?"));
        assertEquals("run_campus_simulation", registry.routeQueryToTool("What if classroom demand increases by 20% in the simulation?"));
        assertEquals("get_esg_metrics", registry.routeQueryToTool("Explain the latest ESG score and the metrics contributing to it"));
        assertEquals("get_historical_trends", registry.routeQueryToTool("Compare the current occupancy with last week's historical average"));
        assertEquals("generate_operational_report", registry.routeQueryToTool("Generate operational summaries and reports"));
        assertEquals("get_esg_metrics", registry.routeQueryToTool("What is the campus water consumption?"));
        assertEquals("detect_energy_anomalies", registry.routeQueryToTool("Show me an administrative anomaly report."));
        assertEquals("compare_scenarios", registry.routeQueryToTool("Compare the normal day with examination day"));
        assertEquals("compare_scenarios", registry.routeQueryToTool("Which tested scenario reduces energy demand the most?"));
        assertEquals("evaluate_mission", registry.routeQueryToTool("Evaluate proposal for the energy reduction mission"));
        assertEquals("get_synthetic_telemetry", registry.routeQueryToTool("Show synthetic telemetry stream across the day"));
        assertEquals("get_campus_building_geometry", registry.routeQueryToTool("Show me the buildings with verified geometry."));
        assertEquals("get_campus_building_geometry", registry.routeQueryToTool("What is the source of this building height?"));
    }

    @Test
    @DisplayName("Building geometry tool reports verified OpenStreetMap footprints and height sources")
    void buildingGeometryToolReportsRealData() {
        ToolResult result = registry.execute("get_campus_building_geometry", Map.of(), "STUDENT");
        assertTrue(result.success());
        assertEquals(SourceClass.ESTIMATED, result.sourceClass());
        assertTrue(result.answer().contains("13.0389 N, 80.0449 E"));
        assertTrue(result.answer().contains("VERIFIED"));
        assertNotNull(result.table());
    }

    @Test
    @DisplayName("Role-based access control denies students administrative anomaly reports and operational summaries")
    void studentDeniedAdministrativeTools() {
        ToolResult studentReport = registry.execute("generate_operational_report", Map.of(), "STUDENT");
        assertFalse(studentReport.success());
        assertTrue(studentReport.errorMessage().contains("Access Denied"));

        ToolResult studentAnomaly = registry.execute("detect_energy_anomalies", Map.of(), "STUDENT");
        assertFalse(studentAnomaly.success());
        assertTrue(studentAnomaly.errorMessage().contains("Access Denied"));
    }
}
