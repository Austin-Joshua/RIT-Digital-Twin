package com.university.erp.intelligence;

import com.university.erp.service.CampusKnowledgeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CampusKnowledgeServiceTest {

    private CampusKnowledgeService knowledgeService;

    @BeforeEach
    void setUp() {
        knowledgeService = new CampusKnowledgeService();
    }

    @Test
    @DisplayName("RAG search finds relevant chunks with citations for energy formula")
    void searchFindsRelevantEnergyChunks() {
        List<CampusKnowledgeService.DocumentChunk> results = knowledgeService.search("energy formula base load kW", "ADMIN", 3);

        assertFalse(results.isEmpty());
        CampusKnowledgeService.DocumentChunk chunk = results.get(0);
        assertTrue(chunk.title().contains("Energy"));
        assertTrue(chunk.content().contains("5.5 kW"));
        assertNotNull(chunk.citation());
        assertTrue(chunk.citation().contains("Digital Twin Energy Specification"));
    }

    @Test
    @DisplayName("RAG search finds space utilization guidelines and thresholds")
    void searchFindsClassroomUtilizationGuidelines() {
        List<CampusKnowledgeService.DocumentChunk> results = knowledgeService.search("classroom utilization 40 slots underutilized", "FACULTY", 3);

        assertFalse(results.isEmpty());
        CampusKnowledgeService.DocumentChunk chunk = results.get(0);
        assertTrue(chunk.title().contains("Classroom") || chunk.title().contains("Space"));
        assertTrue(chunk.content().contains("35%"));
    }

    @Test
    @DisplayName("Role filtering prevents unauthorized access to administrative governance documents")
    void roleFilteringRestrictsAdminChunks() {
        // ADMIN can see Decision Governance chunks
        List<CampusKnowledgeService.DocumentChunk> adminResults = knowledgeService.search("decision authorization governance protocol", "ADMIN", 3);
        assertFalse(adminResults.isEmpty());

        // STUDENT searching decision authorization should not get DEC-01
        List<CampusKnowledgeService.DocumentChunk> studentResults = knowledgeService.search("decision authorization governance protocol", "STUDENT", 3);
        boolean hasDec01 = studentResults.stream().anyMatch(c -> c.id().equals("DEC-01"));
        assertFalse(hasDec01);
    }

    @Test
    @DisplayName("buildRagContext constructs verified citation block")
    void buildRagContextConstructsBlock() {
        String context = knowledgeService.buildRagContext("attendance and timetable hours", "STUDENT");

        assertTrue(context.contains("VERIFIED RAG REFERENCE"));
        assertTrue(context.contains("Campus Operating Procedures"));
    }

    @Test
    @DisplayName("RAG search retrieves curriculum regulation chunks with PDF citations")
    void searchFindsCurriculumRegulations() {
        List<CampusKnowledgeService.DocumentChunk> results = knowledgeService.search("CSBS curriculum credits degree requirements", "STUDENT", 3);

        assertFalse(results.isEmpty());
        CampusKnowledgeService.DocumentChunk chunk = results.stream()
                .filter(c -> c.id().equals("CUR-01"))
                .findFirst()
                .orElse(results.get(0));
        assertTrue(chunk.title().contains("CSBS"), "Actual title: " + chunk.title());
        assertTrue(chunk.citation().contains("CSBS Regulations.pdf"));
        assertTrue(chunk.content().contains("165 credits"));
    }

    @Test
    @DisplayName("RAG search finds Faculty Substitution Protocol for authorized faculty and HOD")
    void searchFindsFacultySubstitutionProtocol() {
        List<CampusKnowledgeService.DocumentChunk> facultyResults = knowledgeService.search("faculty substitution workload clash approval", "FACULTY", 3);
        assertFalse(facultyResults.isEmpty());
        assertTrue(facultyResults.stream().anyMatch(c -> c.id().equals("SUB-01")));

        // Student searching should not get internal faculty substitution protocol
        List<CampusKnowledgeService.DocumentChunk> studentResults = knowledgeService.search("faculty substitution workload clash approval", "STUDENT", 3);
        assertFalse(studentResults.stream().anyMatch(c -> c.id().equals("SUB-01")));
    }
}
