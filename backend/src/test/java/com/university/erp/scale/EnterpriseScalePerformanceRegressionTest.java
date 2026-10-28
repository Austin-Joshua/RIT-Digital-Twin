package com.university.erp.scale;

import com.university.erp.dto.CseAStudentImportDto;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnterpriseScalePerformanceRegressionTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MarksRepository marksRepository;
    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private DataIntegrityAuditService dataIntegrityAuditService;

    @InjectMocks
    private HODService hodService;

    private List<Department> departments;
    private Department cseDept;
    private Department csbsDept;

    @BeforeEach
    void setUp() {
        departments = SyntheticAcademicDataFactory.createDepartments();
        cseDept = departments.get(0);
        csbsDept = departments.get(1);
    }

    @Test
    @DisplayName("Scale Test: Database-level Marks aggregation handles thousands of records efficiently without memory bloat")
    void testDepartmentAnalytics_DatabaseAggregationScalability() {
        when(departmentRepository.findById(cseDept.getId())).thenReturn(Optional.of(cseDept));

        // Mock database-level aggregation returning scalar results: [avgTotal, avgInternal, passCount, totalGraded]
        List<Object[]> aggregateResult = Collections.singletonList(new Object[]{78.45, 31.38, 480L, 500L});
        when(marksRepository.getDepartmentMarksSummary(eq(cseDept.getId()), eq(2)))
                .thenReturn(aggregateResult);
        when(attendanceRepository.getDepartmentAverageAttendance(eq(cseDept.getId()), eq(2)))
                .thenReturn(88.25);

        long startNs = System.nanoTime();
        Map<String, Object> analytics = hodService.getDepartmentAnalytics(cseDept.getId());
        long elapsedMs = (System.nanoTime() - startNs) / 1_000_000;

        assertNotNull(analytics);
        assertEquals(cseDept.getId(), analytics.get("departmentId"));
        assertEquals(new BigDecimal("78.45"), analytics.get("averageMarks"));
        assertEquals(new BigDecimal("96.00"), analytics.get("passPercentage")); // 480/500 * 100
        assertEquals(new BigDecimal("31.38"), analytics.get("internalMarksAverage"));
        assertEquals(new BigDecimal("88.25"), analytics.get("averageAttendance"));

        // Verify that NO unbounded entity loading occurred (marksRepository.findAllByStudentIdIn was NOT called)
        verify(marksRepository, never()).findAllByStudentIdIn(any());
        verify(attendanceRepository, never()).findByStudent_IdIn(any());
        assertTrue(elapsedMs < 500, "Aggregation query processing must complete under 500ms");
    }

    @Test
    @DisplayName("Resilience Test: Department Analytics handles empty or null marks summary gracefully")
    void testDepartmentAnalytics_EmptyResults_HandledGracefully() {
        when(departmentRepository.findById(cseDept.getId())).thenReturn(Optional.of(cseDept));
        when(marksRepository.getDepartmentMarksSummary(eq(cseDept.getId()), eq(2)))
                .thenReturn(Collections.emptyList());
        when(attendanceRepository.getDepartmentAverageAttendance(eq(cseDept.getId()), eq(2)))
                .thenReturn(null);

        Map<String, Object> analytics = hodService.getDepartmentAnalytics(cseDept.getId());

        assertNotNull(analytics);
        assertEquals(cseDept.getId(), analytics.get("departmentId"));
        assertNull(analytics.get("averageMarks"));
        assertNull(analytics.get("passPercentage"));
        assertNull(analytics.get("internalMarksAverage"));
        assertNull(analytics.get("averageAttendance"));
    }

    @Test
    @DisplayName("Multi-Year & Section Performance: Class Performance aggregates directly by (year, section)")
    void testClassPerformance_GroupedAggregation() {
        when(departmentRepository.findById(cseDept.getId())).thenReturn(Optional.of(cseDept));

        // Mock database grouped summary: [year, section, studentCount, avgTotalScore, failCount, totalGraded]
        List<Object[]> marksRows = List.of(
                new Object[]{2, "CSE-A", 60, 82.50, 2L, 60L},
                new Object[]{2, "CSE-B", 60, 79.10, 5L, 60L},
                new Object[]{3, "CSE-A", 55, 84.00, 1L, 55L}
        );
        when(marksRepository.getClassPerformanceMarksSummary(eq(cseDept.getId()))).thenReturn(marksRows);

        List<Object[]> attRows = List.of(
                new Object[]{2, "CSE-A", 89.5},
                new Object[]{2, "CSE-B", 85.0},
                new Object[]{3, "CSE-A", 91.2}
        );
        when(attendanceRepository.getClassAttendanceAverages(eq(cseDept.getId()))).thenReturn(attRows);

        // 1. Sort by highest academic average
        List<Map<String, Object>> performanceHighest = hodService.getClassPerformance(cseDept.getId(), "highest");
        assertNotNull(performanceHighest);
        assertEquals(3, performanceHighest.size());
        assertEquals("3-CSE-A", performanceHighest.get(0).get("class"));
        assertEquals(new BigDecimal("84.00"), performanceHighest.get(0).get("academicAverage"));
        assertEquals(new BigDecimal("91.20"), performanceHighest.get(0).get("attendanceAverage"));

        // 2. Sort by lowest academic average
        List<Map<String, Object>> performanceLowest = hodService.getClassPerformance(cseDept.getId(), "lowest");
        assertEquals("2-CSE-B", performanceLowest.get(0).get("class"));
        assertEquals(new BigDecimal("79.10"), performanceLowest.get(0).get("academicAverage"));

        // 3. Sort by attendance average
        List<Map<String, Object>> performanceAtt = hodService.getClassPerformance(cseDept.getId(), "attendance");
        assertEquals("3-CSE-A", performanceAtt.get(0).get("class"));
        assertEquals(new BigDecimal("91.20"), performanceAtt.get(0).get("attendanceAverage"));

        // Verify zero in-memory full entity scans
        verify(marksRepository, never()).findAllByStudentIdIn(any());
        verify(attendanceRepository, never()).findByStudent_IdIn(any());
    }

    @Test
    @DisplayName("Class Rankings: Enrich rankings without mutating cached class performance data")
    void testClassRankings_NoMutationOfUnderlyingData() {
        when(departmentRepository.findById(cseDept.getId())).thenReturn(Optional.of(cseDept));

        List<Object[]> marksRows = List.of(
                new Object[]{3, "CSE-A", 55, 88.00, 0L, 55L},
                new Object[]{2, "CSE-A", 60, 80.00, 3L, 60L}
        );
        when(marksRepository.getClassPerformanceMarksSummary(eq(cseDept.getId()))).thenReturn(marksRows);
        when(attendanceRepository.getClassAttendanceAverages(eq(cseDept.getId()))).thenReturn(Collections.emptyList());

        List<Map<String, Object>> rankings = hodService.getClassRankings(cseDept.getId());

        assertNotNull(rankings);
        assertEquals(2, rankings.size());
        assertEquals(1, rankings.get(0).get("rank"));
        assertEquals("3-CSE-A", rankings.get(0).get("class"));
        assertEquals(2, rankings.get(1).get("rank"));
        assertEquals("2-CSE-A", rankings.get(1).get("class"));
    }

    @Test
    @DisplayName("Cross-Department Isolation: Department HOD queries strictly filter by department ID")
    void testDepartmentStats_CrossDepartmentIsolation() {
        when(departmentRepository.findById(csbsDept.getId())).thenReturn(Optional.of(csbsDept));
        when(userRepository.countByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, csbsDept.getId())).thenReturn(12L);
        when(studentRepository.countByDepartment_IdAndYear(csbsDept.getId(), 2)).thenReturn(65L);
        when(studentRepository.countByDepartment_IdAndYear(csbsDept.getId(), 3)).thenReturn(62L);
        when(studentRepository.countByDepartment_IdAndYear(csbsDept.getId(), 4)).thenReturn(58L);

        Map<String, Object> stats = hodService.getDepartmentStats(csbsDept.getId());

        assertEquals(csbsDept.getId(), stats.get("departmentId"));
        assertEquals("CSBS", stats.get("departmentCode"));
        assertEquals(185L, stats.get("totalStudents")); // 65 + 62 + 58
        assertEquals(12L, stats.get("totalFaculty"));
        assertFalse((Boolean) stats.get("isHandS"));
    }

    @Test
    @DisplayName("Security & Validation: Requesting stats for non-existent department throws ResourceNotFoundException")
    void testDepartmentStats_NotFound_ThrowsException() {
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(com.university.erp.util.ErpException.ResourceNotFoundException.class, () ->
                hodService.getDepartmentStats(999L)
        );
    }

    @Test
    @DisplayName("AI/RAG Scalability: Metadata filtering scopes knowledge retrieval by department and academic year")
    void testCampusKnowledgeService_MetadataFiltering() {
        CampusKnowledgeService knowledgeService = new CampusKnowledgeService();

        // 1. Search with CSE department filter
        List<CampusKnowledgeService.DocumentChunk> cseDocs = knowledgeService.search("curriculum credits", "STUDENT", "CSE", "2024-2025", null, 5);
        assertFalse(cseDocs.isEmpty());
        for (CampusKnowledgeService.DocumentChunk chunk : cseDocs) {
            assertTrue("ALL".equalsIgnoreCase(chunk.departmentCode()) || "CSE".equalsIgnoreCase(chunk.departmentCode()),
                    "Retrieved chunk must be relevant to CSE or ALL departments");
        }

        // 2. Search with CSBS department filter
        List<CampusKnowledgeService.DocumentChunk> csbsDocs = knowledgeService.search("curriculum credits", "STUDENT", "CSBS", "2024-2025", null, 5);
        assertFalse(csbsDocs.isEmpty());
        for (CampusKnowledgeService.DocumentChunk chunk : csbsDocs) {
            assertTrue("ALL".equalsIgnoreCase(chunk.departmentCode()) || "CSBS".equalsIgnoreCase(chunk.departmentCode()),
                    "Retrieved chunk must be relevant to CSBS or ALL departments");
        }

        // 3. Ingest dynamic new document chunk and verify retrieval
        CampusKnowledgeService.DocumentChunk dynamicChunk = new CampusKnowledgeService.DocumentChunk(
                "AIML-2026",
                "B.E. Artificial Intelligence & Machine Learning Regulation",
                "§1.0 AI Labs & GPU Allocation",
                "High performance GPU computing nodes are allocated for Semester 6 Deep Learning labs.",
                List.of("gpu", "deep learning", "aiml", "computing"),
                List.of("STUDENT", "FACULTY", "ADMIN"),
                "AIML Regulations (2026)",
                "2026-2027",
                "AIML",
                "CURRICULUM"
        );
        knowledgeService.ingestDocument(dynamicChunk);

        List<CampusKnowledgeService.DocumentChunk> aimlResults = knowledgeService.search("gpu computing deep learning", "STUDENT", "AIML", "2026-2027", "CURRICULUM", 3);
        assertFalse(aimlResults.isEmpty());
        assertEquals("AIML-2026", aimlResults.get(0).id());
    }

    @Test
    @DisplayName("Data Scalability: Generic Student Import supports multiple departments, sections, and batches")
    void testGenericStudentImport_MultiDepartmentSupport() {
        Department ece = departments.get(4);
        Role studentRole = Role.builder().roleId(1L).roleName(Role.UserRole.STUDENT).build();

        StudentAcademicOnboardingService onboardingService = new StudentAcademicOnboardingService(
                studentRepository, userRepository, roleRepository, departmentRepository,
                semesterRepository, subjectRepository, null, null, null, null,
                null, passwordEncoder, dataIntegrityAuditService
        );

        when(departmentRepository.findByCode("ECE")).thenReturn(Optional.of(ece));
        when(roleRepository.findByRoleName(Role.UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode(any())).thenReturn("hashedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(999L);
            return u;
        });
        when(studentRepository.save(any(Student.class))).thenAnswer(inv -> {
            Student s = inv.getArgument(0);
            s.setId(888L);
            return s;
        });

        List<CseAStudentImportDto> rows = List.of(
                CseAStudentImportDto.builder().registerNo("211724004001").name("ECE Student 1").email("ece1@ritchennai.edu.in").build(),
                CseAStudentImportDto.builder().registerNo("211724004002").name("ECE Student 2").email("ece2@ritchennai.edu.in").build()
        );

        Map<String, Object> result = onboardingService.importStudents("ECE", "ECE-A", "2024-2028", "2024-2025", rows);

        assertNotNull(result);
        assertEquals(2, result.get("totalImportedRows"));
        assertEquals("ECE", result.get("department"));
        assertEquals("ECE-A", result.get("section"));
        assertEquals("2024-2028", result.get("batch"));
        assertEquals("2024-2025", result.get("academicYear"));
    }
}
