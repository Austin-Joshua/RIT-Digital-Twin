package com.university.erp.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Enterprise Retrieval-Augmented Generation (RAG) service for official campus documentation,
 * equipment manuals, energy formula specifications, sustainability guidelines, academic curricula,
 * and operating procedures with multi-year and departmental scoping.
 */
@Service
public class CampusKnowledgeService {

    public record DocumentChunk(
            String id,
            String title,
            String section,
            String content,
            List<String> keywords,
            List<String> authorizedRoles,
            String citation,
            String academicYear,
            String departmentCode,
            String category
    ) {
        public DocumentChunk(String id, String title, String section, String content,
                             List<String> keywords, List<String> authorizedRoles, String citation) {
            this(id, title, section, content, keywords, authorizedRoles, citation, "2024-2025", "ALL", "OPERATIONS");
        }
    }

    private final List<DocumentChunk> documentStore = new ArrayList<>();

    public CampusKnowledgeService() {
        initializeKnowledgeBase();
    }

    public synchronized void ingestDocument(DocumentChunk chunk) {
        if (chunk != null) {
            documentStore.removeIf(existing -> existing.id().equalsIgnoreCase(chunk.id()));
            documentStore.add(chunk);
        }
    }

    private void initializeKnowledgeBase() {
        // 1. Campus Operating Procedures & Timetable
        documentStore.add(new DocumentChunk(
                "COP-01",
                "Campus Operating Procedures & Academic Calendar",
                "§2.1 Class Timetable & Attendance Regulations",
                "Campus instructional hours run Monday through Friday from 08:30 to 16:30 Asia/Kolkata across 8 scheduled 50-minute periods. Minimum mandatory attendance for semester exam eligibility is 75.0%. Students with attendance below 75% are flagged for academic risk and require faculty proctor review.",
                List.of("attendance", "class", "hours", "timetable", "schedule", "period", "75%", "risk", "proctor"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "Campus Operating Procedures (Rev. 2026), §2.1",
                "2024-2025",
                "ALL",
                "ACADEMIC_OPERATIONS"
        ));

        // 2. Digital Twin Energy Formula Specification
        documentStore.add(new DocumentChunk(
                "ENG-01",
                "Digital Twin Energy Specification & Baseline Loads",
                "§1.0 Energy Demand Formula & Meter Provenance",
                "Building electrical demand in the digital twin is computed via the authoritative formula: Demand (kW) = BaseLoad (kW) + (ActiveClasses * 5.5 kW). Stored base loads are Main Block: 120.0 kW, Hostel Block: 95.0 kW, Science & Library: 45.0 kW. No physical smart meters are currently connected; all telemetry in this module is SIMULATED or ESTIMATED from the timetable grid.",
                List.of("energy", "formula", "kw", "baseload", "meter", "consumption", "power", "main block", "hostel", "library"),
                List.of("ADMIN", "HOD", "FACULTY"),
                "Digital Twin Energy Specification v2.4, §1.0",
                "2024-2025",
                "ALL",
                "SUSTAINABILITY"
        ));

        // 3. Classroom Allocation & Utilization Standards
        documentStore.add(new DocumentChunk(
                "CR-01",
                "Classroom Allocation Guidelines & Space Utilization",
                "§3.2 Room Utilization Thresholds & Optimization",
                "Room utilization is measured against 40 weekly slots (5 days * 8 periods). Rooms with weekly allocation below 35% (fewer than 14 slots) are classified as Underutilized. Rooms with allocation exceeding 85% (more than 34 slots) are classified as Overutilized/Congested. Optimal utilization target is 65% to 80% to accommodate maintenance and unscheduled events.",
                List.of("classroom", "room", "utilization", "allocation", "underutilized", "overutilized", "capacity", "slots"),
                List.of("ADMIN", "HOD", "FACULTY"),
                "Campus Space Optimization Manual, §3.2",
                "2024-2025",
                "ALL",
                "FACILITIES"
        ));

        // 4. Transport & Fleet Logistics
        documentStore.add(new DocumentChunk(
                "TRN-01",
                "RIT Campus Transport Routing & Fleet Operations",
                "§4.1 Route Planning, Bus Capacities, and Boarding Policy",
                "Official RIT bus fleet operations service 24 designated radial routes across Chennai metropolitan area. Standard transit capacity is 50 seated passengers per bus. Boarding requires active institutional RFID/bus-pass verification. Express routes (R-01 through R-08) bypass suburban transfer nodes to achieve a maximum 45-minute campus arrival time by 08:15 IST.",
                List.of("transport", "bus", "route", "fleet", "boarding", "capacity", "stops", "transit"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "Campus Fleet Manual (2026), §4.1",
                "2024-2025",
                "ALL",
                "LOGISTICS"
        ));

        // 5. IoT Sensor Specification & HVAC Simulation Standards
        documentStore.add(new DocumentChunk(
                "IOT-01",
                "Smart Campus Environmental Telemetry & HVAC Protocols",
                "§5.0 Indoor Air Quality & Dynamic HVAC Thresholds",
                "Optimal classroom ambient temperature is targeted at 23.5°C with CO2 concentration maintained below 800 ppm. Real-time telemetry is ingested via MQTT/HTTP gateways at 30-second intervals. Automated HVAC staging initiates fan booster cycles when indoor temperature exceeds 26.0°C or occupant density reaches 90% of certified classroom capacity.",
                List.of("iot", "temperature", "hvac", "co2", "humidity", "sensors", "cooling", "telemetry"),
                List.of("ADMIN", "HOD", "FACULTY"),
                "Smart Campus IoT Standard v1.8, §5.0",
                "2024-2025",
                "ALL",
                "TELEMETRY"
        ));

        // 6. Placement & Career Enablement Eligibility
        documentStore.add(new DocumentChunk(
                "PLC-01",
                "Placement & Training Cell Corporate Engagement Guidelines",
                "§6.3 Tier-1 Placement Eligibility & Minimum Criteria",
                "Tier-1 corporate recruitment drives require a cumulative GPA of >= 7.50 with zero standing arrears at the end of the 6th semester. Mandatory pre-placement requirements include 90% completion of institutional technical training modules, 80% attendance in soft-skills bootcamps, and a verified portfolio project.",
                List.of("placement", "recruitment", "tier-1", "package", "eligibility", "cgpa", "arrears", "training"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "Placement Cell Handbook (2026 Edition), §6.3",
                "2024-2025",
                "ALL",
                "CAREER"
        ));

        // 7. Governance, Human-in-the-Loop & Audit Rules
        documentStore.add(new DocumentChunk(
                "GOV-01",
                "Campus Decision Support & Governance Protocol",
                "§7.2 Human-in-the-Loop Authorization Protocol",
                "The Digital Twin Copilot provides scenario simulation previews, evidence summaries, and recommendations. Authorizing a decision records a human administrative intent in campus_decisions table. The AI copilot CANNOT autonomously execute write actions or alter physical building systems, timetable allocations, or grade books without explicit authorized administrator confirmation.",
                List.of("decision", "authorization", "authorize", "governance", "scenario", "workflow", "human-in-the-loop"),
                List.of("ADMIN", "HOD"),
                "Digital Twin Governance Protocol, §7.2",
                "2024-2025",
                "ALL",
                "GOVERNANCE"
        ));

        // 8. Academic Curriculum & Regulation Framework (CSBS & CSE)
        documentStore.add(new DocumentChunk(
                "CUR-01",
                "RIT B.E. Computer Science and Business Systems (CSBS) Regulations",
                "§3.0 Degree Requirements, Credit Framework, and Contact Periods",
                "The B.E. CSBS program operates under the official Anna University / RIT Autonomous Regulation curriculum. Weekly contact periods (L+T+P) are allocated across 40 periods per semester block. Contact requirements: Discrete Mathematics (4 periods), Management Finance (3 periods), Data Structures (5 periods including practicals). Minimum total credits for degree award is 165 credits with mandatory 75% attendance in each course.",
                List.of("curriculum", "csbs", "regulations", "credits", "syllabus", "degree", "contact", "periods", "course"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "Curriculum/CSBS Regulations.pdf, §3.0",
                "2024-2025",
                "CSBS",
                "CURRICULUM"
        ));

        documentStore.add(new DocumentChunk(
                "CUR-02",
                "RIT B.E. Computer Science and Engineering Syllabus & Credit Structure",
                "§2.4 Core & Elective Contact Hours, Laboratory Credits, and Graduation Criteria",
                "The B.E. CSE curriculum specifies core professional courses, open electives, and integrated laboratory periods. Theory courses carry 3 or 4 credits (3 to 4 contact periods weekly), while laboratory courses carry 1.5 to 2 credits (minimum 3 practical periods weekly). Project work in final year carries 10 credits. Continuous internal assessment (CIA) accounts for 40% and end-semester examinations account for 60% of total course marks.",
                List.of("curriculum", "cse", "computer science", "syllabus", "credits", "laboratory", "cia", "exam", "marks"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "Curriculum/Computer Science Curriculum.pdf, §2.4",
                "2024-2025",
                "CSE",
                "CURRICULUM"
        ));

        // 9. Faculty Substitution & Workload Equity Protocol
        documentStore.add(new DocumentChunk(
                "SUB-01",
                "RIT Academic Regulations & Faculty Substitution Protocol",
                "§4.2 Faculty Leave, Emergency Class Substitution, and Workload Equity",
                "When a faculty member is on approved leave or official duty, an authorized class substitution must be initiated through the Digital Twin Faculty Substitution module. Substitutions are matched based on department affiliation, subject expertise, and timetable availability without schedule clashes. Maximum allowable faculty workload is monitored to prevent burnout. All substitution assignments require HOD or Academic Dean approval and are auditable in institutional records.",
                List.of("substitution", "substitute", "faculty", "leave", "clash", "workload", "override", "approval", "hod"),
                List.of("ADMIN", "HOD", "FACULTY"),
                "RIT Faculty Handbook & Academic Regulations (Rev. 2026), §4.2",
                "2024-2025",
                "ALL",
                "ACADEMIC_OPERATIONS"
        ));
    }

    /**
     * Retrieves ranked, permission-filtered document chunks relevant to the user's query with metadata scoping.
     */
    public List<DocumentChunk> search(String query, String userRole, String departmentCode, String academicYear, String category, int maxResults) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String normalizedRole = userRole == null ? "" : userRole.replace("ROLE_", "").toUpperCase();
        String lowerQuery = query.toLowerCase(Locale.ROOT);
        String[] tokens = lowerQuery.split("\\W+");

        List<ScoredChunk> scored = new ArrayList<>();

        for (DocumentChunk chunk : documentStore) {
            // Permission check
            if (!chunk.authorizedRoles().contains(normalizedRole) && !normalizedRole.equals("ADMIN")) {
                continue;
            }

            // Department metadata filter
            if (departmentCode != null && !departmentCode.isBlank() && !"ALL".equalsIgnoreCase(chunk.departmentCode())
                    && !departmentCode.equalsIgnoreCase(chunk.departmentCode())) {
                continue;
            }

            // Academic Year metadata filter
            if (academicYear != null && !academicYear.isBlank() && !"ALL".equalsIgnoreCase(chunk.academicYear())
                    && !academicYear.equalsIgnoreCase(chunk.academicYear())) {
                continue;
            }

            // Category filter
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase(chunk.category())) {
                continue;
            }

            int score = 0;
            String lowerContent = chunk.content().toLowerCase(Locale.ROOT);
            String lowerTitle = chunk.title().toLowerCase(Locale.ROOT);

            for (String kw : chunk.keywords()) {
                if (lowerQuery.contains(kw)) {
                    score += 15;
                }
            }

            for (String token : tokens) {
                if (token.length() > 2) {
                    if (lowerTitle.contains(token)) {
                        score += 8;
                    }
                    if (lowerContent.contains(token)) {
                        score += 3;
                    }
                }
            }

            if (score > 0) {
                scored.add(new ScoredChunk(chunk, score));
            }
        }

        scored.sort((a, b) -> Integer.compare(b.score, a.score));

        List<DocumentChunk> results = new ArrayList<>();
        int limit = Math.min(scored.size(), Math.max(1, maxResults));
        for (int i = 0; i < limit; i++) {
            results.add(scored.get(i).chunk());
        }
        return results;
    }

    public List<DocumentChunk> search(String query, String userRole, int maxResults) {
        return search(query, userRole, null, null, null, maxResults);
    }

    /**
     * Generates grounded RAG context with citations to accompany structured data.
     */
    public String buildRagContext(String query, String userRole, String departmentCode, String academicYear) {
        List<DocumentChunk> chunks = search(query, userRole, departmentCode, academicYear, null, 3);
        if (chunks.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder("\nRELEVANT CAMPUS PROCEDURES & SPECIFICATIONS (VERIFIED RAG REFERENCE):\n");
        for (DocumentChunk chunk : chunks) {
            sb.append("--- Reference: ").append(chunk.citation()).append(" ---\n")
              .append(chunk.content()).append("\n\n");
        }
        return sb.toString();
    }

    public String buildRagContext(String query, String userRole) {
        return buildRagContext(query, userRole, null, null);
    }

    private record ScoredChunk(DocumentChunk chunk, int score) {}
}
