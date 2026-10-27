package com.university.erp.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Retrieval-Augmented Generation (RAG) service for official campus documentation,
 * equipment manuals, energy formula specifications, sustainability guidelines, and operating procedures.
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
            String citation
    ) {}

    private final List<DocumentChunk> documentStore = new ArrayList<>();

    public CampusKnowledgeService() {
        initializeKnowledgeBase();
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
                "Campus Operating Procedures (Rev. 2026), §2.1"
        ));

        // 2. Digital Twin Energy Formula Specification
        documentStore.add(new DocumentChunk(
                "ENG-01",
                "Digital Twin Energy Specification & Baseline Loads",
                "§1.0 Energy Demand Formula & Meter Provenance",
                "Building electrical demand in the digital twin is computed via the authoritative formula: Demand (kW) = BaseLoad (kW) + (ActiveClasses * 5.5 kW). Stored base loads are Main Block: 120.0 kW, Hostel Block: 95.0 kW, Science & Library: 45.0 kW. No physical smart meters are currently connected; all telemetry in this module is SIMULATED or ESTIMATED from the timetable grid.",
                List.of("energy", "formula", "kw", "baseload", "meter", "consumption", "power", "main block", "hostel", "library"),
                List.of("ADMIN", "HOD", "FACULTY"),
                "Digital Twin Energy Specification v2.4, §1.0"
        ));

        // 3. Classroom Allocation & Utilization Standards
        documentStore.add(new DocumentChunk(
                "CR-01",
                "Classroom Allocation Guidelines & Space Utilization",
                "§3.2 Room Utilization Thresholds & Optimization",
                "Room utilization is measured against 40 weekly slots (5 days * 8 periods). Rooms with weekly allocation below 35% (fewer than 14 slots) are classified as Underutilized. Rooms with allocation exceeding 85% (more than 34 slots) are classified as Overutilized/Congested. Optimal utilization target is 65% to 80% to accommodate maintenance and unscheduled events.",
                List.of("classroom", "room", "utilization", "allocation", "underutilized", "overutilized", "capacity", "slots"),
                List.of("ADMIN", "HOD", "FACULTY"),
                "Campus Space Optimization Manual, §3.2"
        ));

        // 4. Transport & Fleet Logistics
        documentStore.add(new DocumentChunk(
                "TR-01",
                "Transport Operations & Fleet Decarbonization Guide",
                "§4.1 Route Efficiency & Fuel Computation",
                "The university operates 8 dedicated transport routes serving North, South, East, and West residential zones. Diesel fuel consumption is modeled at 0.55 L/km base + 0.02 L per student passenger. Carbon emissions factor is standard 2.68 kg CO2 per litre of diesel. The 20% EV bus replacement scenario targets 4.8-year payback with 22% annual fuel cost reduction.",
                List.of("transport", "bus", "route", "fuel", "diesel", "ev", "emissions", "carbon", "fleet", "co2"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "RIT Fleet Operations Guide, §4.1"
        ));

        // 5. ESG & Campus Sustainability Framework
        documentStore.add(new DocumentChunk(
                "ESG-01",
                "Institutional ESG & Sustainability Framework",
                "§5.0 Sustainability Indicators & Scope 1/2 Metrics",
                "Campus sustainability scoring synthesizes energy formula demand, fleet transport fuel burn, and renewable solar offset. Total daily fleet CO2 is computed at (dailyFuelLitres * 2.68 kg). Water consumption and solid waste metrics are marked UNAVAILABLE because no utility ledgers are connected to the digital twin database.",
                List.of("esg", "sustainability", "carbon", "co2", "green", "solar", "waste", "water", "score"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "RIT ESG Sustainability Framework, §5.0"
        ));

        // 6. Data Provenance & Architectural Boundaries
        documentStore.add(new DocumentChunk(
                "PRV-01",
                "Digital Twin Data Provenance Standards",
                "§6.0 Provenance Classification Rules",
                "Every telemetry metric must carry a valid provenance tag: LIVE (verified sensor feed), HISTORICAL (recorded past measurement in database), SIMULATED (computed by scenario simulation engine), PREDICTED (trend projection by forecasting engine), ESTIMATED (derived from timetable schedules), or UNKNOWN (unverified). The AI assistant must NEVER present ESTIMATED or SIMULATED figures as LIVE sensor data.",
                List.of("provenance", "live", "simulated", "historical", "predicted", "estimated", "unknown", "sensor", "truth"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "RIT Digital Twin Architecture Standard, §6.0"
        ));

        // 7. Decision Support Protocol & Authorization
        documentStore.add(new DocumentChunk(
                "DEC-01",
                "Campus Decision Support & Governance Protocol",
                "§7.2 Human-in-the-Loop Authorization Protocol",
                "The Digital Twin Copilot provides scenario simulation previews, evidence summaries, and recommendations. Authorizing a decision records a human administrative intent in campus_decisions table. The AI copilot CANNOT autonomously execute write actions or alter physical building systems, timetable allocations, or grade books without explicit authorized administrator confirmation.",
                List.of("decision", "authorization", "authorize", "governance", "scenario", "workflow", "human-in-the-loop"),
                List.of("ADMIN", "HOD"),
                "Digital Twin Governance Protocol, §7.2"
        ));

        // 8. Academic Curriculum & Regulation Framework (CSBS & CSE)
        documentStore.add(new DocumentChunk(
                "CUR-01",
                "RIT B.E. Computer Science and Business Systems (CSBS) Regulations",
                "§3.0 Degree Requirements, Credit Framework, and Contact Periods",
                "The B.E. CSBS program operates under the official Anna University / RIT Autonomous Regulation curriculum. Weekly contact periods (L+T+P) are allocated across 40 periods per semester block. Contact requirements: Discrete Mathematics (4 periods), Management Finance (3 periods), Data Structures (5 periods including practicals). Minimum total credits for degree award is 165 credits with mandatory 75% attendance in each course.",
                List.of("curriculum", "csbs", "regulations", "credits", "syllabus", "degree", "contact", "periods", "course"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "Curriculum/CSBS Regulations.pdf, §3.0"
        ));

        documentStore.add(new DocumentChunk(
                "CUR-02",
                "RIT B.E. Computer Science and Engineering Syllabus & Credit Structure",
                "§2.4 Core & Elective Contact Hours, Laboratory Credits, and Graduation Criteria",
                "The B.E. CSE curriculum specifies core professional courses, open electives, and integrated laboratory periods. Theory courses carry 3 or 4 credits (3 to 4 contact periods weekly), while laboratory courses carry 1.5 to 2 credits (minimum 3 practical periods weekly). Project work in final year carries 10 credits. Continuous internal assessment (CIA) accounts for 40% and end-semester examinations account for 60% of total course marks.",
                List.of("curriculum", "cse", "computer science", "syllabus", "credits", "laboratory", "cia", "exam", "marks"),
                List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT"),
                "Curriculum/Computer Science Curriculum.pdf, §2.4"
        ));

        // 9. Faculty Substitution & Workload Equity Protocol
        documentStore.add(new DocumentChunk(
                "SUB-01",
                "RIT Academic Regulations & Faculty Substitution Protocol",
                "§4.2 Faculty Leave, Emergency Class Substitution, and Workload Equity",
                "When a faculty member is on approved leave or official duty, an authorized class substitution must be initiated through the Digital Twin Faculty Substitution module. Substitutions are matched based on department affiliation, subject expertise, and timetable availability without schedule clashes. Maximum allowable faculty workload is monitored to prevent burnout. All substitution assignments require HOD or Academic Dean approval and are auditable in institutional records.",
                List.of("substitution", "substitute", "faculty", "leave", "clash", "workload", "override", "approval", "hod"),
                List.of("ADMIN", "HOD", "FACULTY"),
                "RIT Faculty Handbook & Academic Regulations (Rev. 2026), §4.2"
        ));
    }

    /**
     * Retrieves ranked, permission-filtered document chunks relevant to the user's query.
     */
    public List<DocumentChunk> search(String query, String userRole, int maxResults) {
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

    /**
     * Generates grounded RAG context with citations to accompany structured data.
     */
    public String buildRagContext(String query, String userRole) {
        List<DocumentChunk> chunks = search(query, userRole, 3);
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

    private record ScoredChunk(DocumentChunk chunk, int score) {}
}
