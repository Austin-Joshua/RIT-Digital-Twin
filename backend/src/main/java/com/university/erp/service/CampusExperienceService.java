package com.university.erp.service;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.AttendanceRisk;
import com.university.erp.model.PerformanceWarning;
import com.university.erp.model.Student;
import com.university.erp.model.StudentTransportMapping;
import com.university.erp.model.TimetableSlot;
import com.university.erp.model.User;
import com.university.erp.repository.AttendanceRiskRepository;
import com.university.erp.repository.FacultySubjectRepository;
import com.university.erp.repository.PerformanceWarningRepository;
import com.university.erp.repository.PlacementOpportunityRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.repository.StudentTransportRepository;
import com.university.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CampusExperienceService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");

    private final CampusStateService campusStateService;
    private final CampusAlertService campusAlertService;
    private final CampusDecisionService campusDecisionService;
    private final TimetableService timetableService;
    private final ErpCoreService erpCoreService;
    private final HODService hodService;
    private final ParentService parentService;
    private final AttendanceRiskRepository attendanceRiskRepository;
    private final PerformanceWarningRepository performanceWarningRepository;
    private final FacultySubjectRepository facultySubjectRepository;
    private final PlacementOpportunityRepository placementOpportunityRepository;
    private final StudentTransportRepository studentTransportRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> home() {
        String role = role();
        List<Map<String, Object>> sections = switch (role) {
            case "ADMIN" -> admin();
            case "HOD" -> hod();
            case "FACULTY" -> faculty();
            case "PARENT" -> parent();
            case "STUDENT" -> student();
            default -> List.of(unavailable("home", "Home", "This login has no campus experience."));
        };
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("role", role);
        body.put("layer", "RIT Digital Twin");
        body.put("separateProduct", false);
        body.put("performsActions", false);
        body.put("because", "One experience service. The same intelligence records are filtered to this login. Missing records stay missing.");
        body.put("priorities", priorities(role));
        body.put("sections", sections);
        return body;
    }

    private List<Map<String, Object>> admin() {
        Map<String, Object> command = command();
        Map<String, Object> alerts = campusAlertService.center(command, true);
        Map<String, Object> decisions = campusDecisionService.list(true);
        return List.of(
                campusHealth(command),
                twin(),
                operations(command),
                predictions(alerts),
                alertSummary(alerts),
                simulations(),
                decisions(decisions)
        );
    }

    private List<Map<String, Object>> hod() {
        User user = currentUser().orElse(null);
        if (user == null || user.getDepartment() == null || user.getDepartment().getId() == null) {
            return List.of(unavailable("department", "Department health", "This HOD login has no department, so department records are not read."));
        }
        try {
            Long departmentId = user.getDepartment().getId();
            String department = user.getDepartment().getDeptName();
            Map<String, Object> stats = hodService.getDepartmentStats(departmentId);
            Map<String, Object> analytics = hodService.getDepartmentAnalytics(departmentId);
            return List.of(
                    departmentHealth(department, stats),
                    studentPerformance(analytics),
                    departmentAttendance(analytics),
                    subjectRisk(departmentId),
                    facultyWorkload(stats),
                    placement(),
                    resources()
            );
        } catch (RuntimeException ex) {
            return List.of(unavailable("department", "Department health", "Department records could not be read. No estimated department is substituted."));
        }
    }

    private List<Map<String, Object>> faculty() {
        User user = currentUser().orElse(null);
        List<TimetableSlot> today = user == null ? List.of() : today(timetableService.getFacultyTimetable(user.getId()));
        Set<String> sections = assignedSections(user, today);
        return List.of(
                schedule("classes", "Today's classes", today, "/faculty/timetable", "Open timetable"),
                unavailable("attendance", "Attendance", "A semester attendance average is not stored for this login.",
                        "/faculty/attendance", "Open attendance"),
                unavailable("grading", "Grading", "Pending marks are not summarized. This home does not submit grades.",
                        "/faculty/grading", "Open marks"),
                facultyRisk(sections),
                unavailable("trends", "Academic trends", "No faculty-scoped trend series is stored. A confidence score is not invented."),
                workload(today, user),
                classrooms(today)
        );
    }

    private List<Map<String, Object>> student() {
        Student owner = currentStudent().orElse(null);
        List<TimetableSlot> today = owner == null ? List.of() : today(timetableService.getStudentTimetable(owner.getUser().getId()));
        List<Map<String, Object>> attendance = owner == null ? List.of() : safeAttendance(owner.getUser().getId());
        return List.of(
                schedule("schedule", "Today's schedule", today, "/student/timetable", "Open timetable"),
                attendance(attendance, "/student/attendance", "Open attendance"),
                ownRisk(owner, "risk", "Academic risk"),
                unavailable("deadlines", "Upcoming deadlines", "No assignment or fee deadline table is stored."),
                unavailable("events", "Campus events", "Campus events are not stored. Club membership is not treated as an event."),
                transport(owner),
                recommendations(owner)
        );
    }

    private List<Map<String, Object>> parent() {
        Student ward = linkedStudent();
        List<Map<String, Object>> attendance = ward == null || ward.getUser() == null
                ? List.of() : safeAttendance(ward.getUser().getId());
        String who = ward == null ? "the linked student" : displayName(ward);
        return List.of(
                ward == null
                        ? unavailable("attendance", "Attendance", "No linked student is stored for this parent login.")
                        : attendance(attendance, "/parent/attendance", "Open attendance"),
                parentPerformance(ward),
                unavailable("fees", "Fees", "No fee ledger is stored. An amount is not estimated."),
                ward == null
                        ? unavailable("alerts", "Important alerts", "No linked student is stored, so alerts cannot be read.")
                        : ownRisk(ward, "alerts", "Important alerts"),
                weekly(who, attendance, ward)
        );
    }

    private Map<String, Object> campusHealth(Map<String, Object> command) {
        List<Map<String, Object>> items = new ArrayList<>();
        Object overall = command.get("overall");
        if (overall instanceof Map<?, ?> row && row.get("score") instanceof Number score) {
            items.add(item("Campus score", score + " of 100", "Estimated from scored categories only. Energy, transport, and safety stay unscored."));
        }
        Object health = command.get("health");
        if (health instanceof List<?> rows) {
            for (Object entry : rows) {
                if (!(entry instanceof Map<?, ?> row)) {
                    continue;
                }
                String name = String.valueOf(row.get("name"));
                if (row.get("score") instanceof Number score) {
                    items.add(item(name, score + " of 100", String.valueOf(row.get("because"))));
                } else {
                    items.add(item(name, "Not scored", String.valueOf(row.get("because"))));
                }
            }
        }
        if (items.isEmpty()) {
            return empty("health", "Campus health", "No campus health score is stored yet.");
        }
        return ready("health", "Campus health", SourceClass.ESTIMATED, items,
                "Same command snapshot used by the admin home. Not a live sensor feed.", null, null);
    }

    private Map<String, Object> twin() {
        return ready("twin", "Digital twin", SourceClass.ESTIMATED,
                List.of(item("Campus map", "Existing spatial view", "A building is colored only when its stored name matches a shape.")),
                "The map is the spatial interface. This home does not add a second map.",
                "/map", "Open map");
    }

    private Map<String, Object> operations(Map<String, Object> command) {
        List<Map<String, Object>> items = new ArrayList<>();
        addIndicator(items, command, "activeClasses", "Active classes");
        addIndicator(items, command, "occupiedClassrooms", "Occupied classrooms");
        addIndicator(items, command, "transportRoutes", "Transport routes");
        items.add(item("Energy", "Not a meter", "No campus meter is connected. The formula is not treated as operations health."));
        return ready("operations", "Operations", SourceClass.ESTIMATED, items,
                "Timetable and stored room records. Transport is a directory size, not vehicle positions.",
                "/classrooms/allocation", "Open classrooms");
    }

    private Map<String, Object> predictions(Map<String, Object> alerts) {
        int cards = count(alerts.get("predictionCards"));
        if (cards == 0) {
            return empty("predictions", "Predictions", "No scored prediction card is stored. A forecast is not invented to fill this home.");
        }
        return ready("predictions", "Predictions", SourceClass.PREDICTED,
                List.of(item("Prediction cards", String.valueOf(cards), "From the existing alert center. Confidence stays on that card.")),
                "Same prediction cards. Not a second model.",
                "/predictions", "Open predictions");
    }

    private Map<String, Object> alertSummary(Map<String, Object> alerts) {
        int open = 0;
        Object raw = alerts.get("alerts");
        if (raw instanceof List<?> rows) {
            for (Object row : rows) {
                if (row instanceof Map<?, ?> alert && !"RESOLVED".equals(String.valueOf(alert.get("status")))) {
                    open++;
                }
            }
        }
        if (open == 0) {
            return empty("alerts", "Alerts", "No open campus alert is stored.");
        }
        return ready("alerts", "Alerts", SourceClass.ESTIMATED,
                List.of(item("Open alerts", String.valueOf(open), "Lifecycle stays on the alert center. Names are not added here.")),
                "Same alert service used by the alert center.",
                "/predictions", "Open alert center");
    }

    private Map<String, Object> simulations() {
        return ready("simulations", "Simulations", SourceClass.SIMULATED,
                List.of(item("Simulation lab", "Read-only scenarios", "Results stay labeled simulated and do not replace campus state.")),
                "Existing scenario service. This home does not run one.",
                "/simulations", "Open simulation lab");
    }

    private Map<String, Object> decisions(Map<String, Object> decisions) {
        int problems = count(decisions.get("problems"));
        if (problems == 0) {
            return empty("decisions", "Decisions", "No open problem is waiting for a decision.");
        }
        return ready("decisions", "Decisions", SourceClass.ESTIMATED,
                List.of(item("Open problems", String.valueOf(problems), "Authorization records a planning choice. It does not change campus systems.")),
                "Same decision service. This home does not authorize an action.",
                "/predictions", "Open decisions");
    }

    private Map<String, Object> departmentHealth(String department, Map<String, Object> stats) {
        List<Map<String, Object>> items = new ArrayList<>();
        items.add(item("Department", department == null ? "Stored department" : department, "HOD reporting view for this login only."));
        if (stats.get("totalStudents") instanceof Number students) {
            items.add(item("Students", String.valueOf(students.longValue()), "Department roster. Not a live headcount."));
        }
        if (stats.get("totalFaculty") instanceof Number faculty) {
            items.add(item("Faculty accounts", String.valueOf(faculty.longValue()), "Faculty users in this department."));
        }
        return ready("department", "Department health", SourceClass.HISTORICAL, items,
                "Existing HOD department stats. Other departments are not included.", null, null);
    }

    private Map<String, Object> studentPerformance(Map<String, Object> analytics) {
        List<Map<String, Object>> items = new ArrayList<>();
        if (analytics.get("averageMarks") != null) {
            items.add(item("Average marks", String.valueOf(analytics.get("averageMarks")), "Stored marks for students under this HOD."));
        }
        if (analytics.get("passPercentage") != null) {
            items.add(item("Pass share", String.valueOf(analytics.get("passPercentage")), "Graded stored marks. Not a forecast."));
        }
        if (items.isEmpty()) {
            return empty("performance", "Student performance", "No department marks are stored, so a performance figure is not estimated.");
        }
        return ready("performance", "Student performance", SourceClass.HISTORICAL, items,
                "Existing HOD analytics. Student names are not listed on this home.", null, null);
    }

    private Map<String, Object> departmentAttendance(Map<String, Object> analytics) {
        if (analytics.get("averageAttendance") == null) {
            return empty("attendance", "Attendance", "No department attendance percentage is stored.");
        }
        return ready("attendance", "Attendance", SourceClass.HISTORICAL,
                List.of(item("Average attendance", String.valueOf(analytics.get("averageAttendance")), "Stored attendance rows. Not a live roll call.")),
                "Existing HOD analytics.", null, null);
    }

    private Map<String, Object> subjectRisk(Long departmentId) {
        List<Map<String, Object>> weak = hodService.getWeakSubjects(departmentId, null, null);
        if (weak.isEmpty()) {
            return empty("subjects", "Subject risk", "No stored subject meets the existing weak-subject rule, or no marks are stored.");
        }
        List<Map<String, Object>> items = new ArrayList<>();
        for (Map<String, Object> row : weak.stream().limit(6).toList()) {
            items.add(item(String.valueOf(row.get("subjectName")),
                    "Average " + row.get("averageScore"),
                    "Failure share of graded marks " + row.get("failureRate") + "%. Historical, not a forecast."));
        }
        return ready("subjects", "Subject risk", SourceClass.HISTORICAL, items,
                "Same weak-subject rule already used by the HOD service.", null, null);
    }

    private Map<String, Object> facultyWorkload(Map<String, Object> stats) {
        if (!(stats.get("totalFaculty") instanceof Number faculty) || faculty.longValue() == 0) {
            return empty("workload", "Faculty workload", "No faculty accounts are stored in this department. Hours per person are not invented.");
        }
        return ready("workload", "Faculty workload", SourceClass.HISTORICAL,
                List.of(item("Faculty accounts", String.valueOf(faculty.longValue()), "Hours per person are not stored, so a workload percentage is not estimated.")),
                "Account count only.", null, null);
    }

    private Map<String, Object> placement() {
        long open = placementOpportunityRepository.findAll().stream()
                .filter(row -> row.getStatus() != null && "open".equalsIgnoreCase(row.getStatus()))
                .count();
        if (open == 0) {
            return empty("placement", "Placement", "No open placement opportunity is stored. A placement rate is not estimated.");
        }
        return ready("placement", "Placement", SourceClass.HISTORICAL,
                List.of(item("Open opportunities", String.valueOf(open), "Stored opportunity records. Not a department placement percentage.")),
                "Placement directory. Not a second placement model.", null, null);
    }

    private Map<String, Object> resources() {
        Map<String, Object> command = command();
        List<Map<String, Object>> items = new ArrayList<>();
        addIndicator(items, command, "occupiedClassrooms", "Occupied classrooms");
        addIndicator(items, command, "availableClassrooms", "Available classrooms");
        if (items.isEmpty()) {
            return empty("resources", "Resource utilization", "No classroom utilization is stored for this hour.");
        }
        return ready("resources", "Resource utilization", SourceClass.ESTIMATED, items,
                "Campus timetable density from the command snapshot. Not a department occupancy sensor.", null, null);
    }

    private Map<String, Object> facultyRisk(Set<String> sections) {
        if (sections.isEmpty()) {
            return unavailable("risk", "At-risk students", "No section is stored on this faculty timetable or assignment, so other students are not listed.");
        }
        List<String> keys = sections.stream().map(section -> section.toLowerCase(Locale.ROOT)).toList();
        List<Map<String, Object>> items = new ArrayList<>();
        for (AttendanceRisk risk : attendanceRiskRepository.findElevatedBySections(keys).stream().limit(6).toList()) {
            items.add(item(displayName(risk.getStudent()), risk.getRiskLevel() + " attendance risk",
                    "Section " + risk.getStudent().getSection() + ". Stored row, not a dropout probability."));
        }
        for (PerformanceWarning warning : performanceWarningRepository.findOpenBySections(keys).stream().limit(6).toList()) {
            if (items.size() >= 8) {
                break;
            }
            items.add(item(displayName(warning.getStudent()), warning.getStatus() == null ? "Open warning" : warning.getStatus(),
                    warning.getObservation() == null ? "Stored performance warning." : warning.getObservation()));
        }
        if (items.isEmpty()) {
            return empty("risk", "At-risk students", "No high or medium attendance-risk row and no open performance warning is stored for the assigned sections.");
        }
        return ready("risk", "At-risk students", SourceClass.HISTORICAL, items,
                "Limited to sections on this faculty timetable or approved assignment. Other students are not listed.",
                "/faculty/risk-heatmap", "Open class risk");
    }

    private Map<String, Object> workload(List<TimetableSlot> today, User user) {
        long assigned = user == null ? 0 : facultySubjectRepository.findByFaculty_User_Id(user.getId()).stream()
                .filter(row -> row.getApprovalStatus() == null || "APPROVED".equalsIgnoreCase(row.getApprovalStatus()))
                .count();
        long sections = today.stream()
                .map(slot -> slot.getSection())
                .filter(section -> section != null && !section.isBlank())
                .distinct()
                .count();
        if (today.isEmpty() && assigned == 0) {
            return empty("workload", "Workload", "No class is scheduled today and no approved subject assignment is stored.");
        }
        return ready("workload", "Workload", SourceClass.HISTORICAL, List.of(
                item("Classes today", String.valueOf(today.size()), "Timetable slots for this login."),
                item("Sections today", String.valueOf(sections), "Distinct sections on today's slots."),
                item("Approved subjects", String.valueOf(assigned), "Stored assignments. Hours are not converted into a load percentage.")
        ), "Timetable and assignment records. Not an invented workload score.", "/faculty/timetable", "Open timetable");
    }

    private Map<String, Object> classrooms(List<TimetableSlot> today) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (TimetableSlot slot : today) {
            if (slot.getClassroom() == null || items.size() >= 6) {
                continue;
            }
            String building = slot.getClassroom().getBuilding() == null ? "Unassigned building" : slot.getClassroom().getBuilding().getName();
            items.add(item(building + " · " + slot.getClassroom().getName(),
                    subjectName(slot) + " · " + clock(slot.getStartTime()),
                    "Stored room on the timetable. Not a live occupancy reading."));
        }
        if (items.isEmpty()) {
            return empty("classrooms", "Classroom information", "No classroom is stored on today's classes.");
        }
        return ready("classrooms", "Classroom information", SourceClass.HISTORICAL, items,
                "Rooms already attached to this faculty timetable.", null, null);
    }

    private Map<String, Object> schedule(String id, String title, List<TimetableSlot> today, String path, String linkLabel) {
        if (today.isEmpty()) {
            return empty(id, title, "No class is stored for " + dayLabel() + ".");
        }
        List<Map<String, Object>> items = new ArrayList<>();
        for (TimetableSlot slot : today.stream().limit(8).toList()) {
            String room = slot.getClassroom() == null ? "Room not stored" : slot.getClassroom().getName();
            String section = slot.getSection() == null ? "" : " · " + slot.getSection();
            items.add(item(clock(slot.getStartTime()) + "–" + clock(slot.getEndTime()),
                    subjectName(slot) + section,
                    room));
        }
        return ready(id, title, SourceClass.HISTORICAL, items,
                "Timetable for this login. Section sizes of other groups are not included.", path, linkLabel);
    }

    private Map<String, Object> attendance(List<Map<String, Object>> rows, String path, String linkLabel) {
        if (rows.isEmpty()) {
            return empty("attendance", "Attendance", "No attendance records are stored for this account.");
        }
        double sum = 0;
        int count = 0;
        List<Map<String, Object>> items = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            if (row.get("percentage") instanceof Number percentage) {
                sum += percentage.doubleValue();
                count++;
            }
            if (items.size() < 6) {
                items.add(item(String.valueOf(row.get("subjectName")),
                        row.get("percentage") + "%",
                        row.get("present") + " of " + row.get("total") + " stored records"));
            }
        }
        if (count > 0) {
            items.add(0, item("Stored average", Math.round(sum / count) + "%", "Mean of stored subject percentages. Not a live roll call."));
        }
        return ready("attendance", "Attendance", SourceClass.HISTORICAL, items,
                "Existing attendance summary for this account.", path, linkLabel);
    }

    private Map<String, Object> ownRisk(Student student, String id, String title) {
        if (student == null) {
            return unavailable(id, title, "No student record is stored for this login.");
        }
        List<AttendanceRisk> risks = attendanceRiskRepository.findByStudent_IdOrderByAnalyzedAtDesc(student.getId());
        List<PerformanceWarning> warnings = performanceWarningRepository.findByStudent_IdOrderByAnalyzedAtDesc(student.getId()).stream()
                .filter(row -> row.getIsResolved() == null || !row.getIsResolved()).toList();
        List<Map<String, Object>> items = new ArrayList<>();
        if (student.getCurrentCgpa() != null) {
            items.add(item("Stored CGPA", student.getCurrentCgpa().toPlainString(), "Historical academic record. Not a predicted grade."));
        }
        if (student.getArrearCount() != null) {
            items.add(item("Stored arrears", String.valueOf(student.getArrearCount()), "Stored count. Not a forecast."));
        }
        if (!risks.isEmpty()) {
            items.add(item("Attendance risk", risks.get(0).getRiskLevel() == null ? "Stored" : risks.get(0).getRiskLevel(),
                    "Latest stored attendance-risk row."));
        }
        if (!warnings.isEmpty()) {
            items.add(item("Open warnings", String.valueOf(warnings.size()), "Stored performance warnings. Other students are not listed."));
        }
        if (items.isEmpty()) {
            return empty(id, title, "No attendance-risk or performance-warning row is stored. A risk level is not invented.");
        }
        return ready(id, title, SourceClass.HISTORICAL, items,
                "Own stored rows only. This is not a future grade forecast.", null, null);
    }

    private Map<String, Object> parentPerformance(Student ward) {
        if (ward == null) {
            return unavailable("performance", "Academic performance", "No linked student is stored for this parent login.");
        }
        List<Map<String, Object>> items = new ArrayList<>();
        items.add(item("Student", displayName(ward), ward.getRegisterNo() == null ? "Linked student" : ward.getRegisterNo()));
        if (ward.getCurrentCgpa() != null) {
            items.add(item("Stored CGPA", ward.getCurrentCgpa().toPlainString(), "Historical. Not a predicted grade."));
        }
        List<Map<String, Object>> marks = safeMarks(ward.getUser().getId());
        if (!marks.isEmpty()) {
            items.add(item("Internal mark rows", String.valueOf(marks.size()), "Stored internal marks. Subject scores stay on the grades page."));
        }
        if (items.size() == 1 && ward.getCurrentCgpa() == null) {
            return empty("performance", "Academic performance", "No CGPA or internal marks are stored for the linked student.");
        }
        return ready("performance", "Academic performance", SourceClass.HISTORICAL, items,
                "Linked student only.", "/parent/grades", "Open grades");
    }

    private Map<String, Object> weekly(String who, List<Map<String, Object>> attendance, Student ward) {
        int warnings = ward == null ? 0 : (int) performanceWarningRepository.findByStudent_IdOrderByAnalyzedAtDesc(ward.getId()).stream()
                .filter(row -> row.getIsResolved() == null || !row.getIsResolved()).count();
        if (attendance.isEmpty() && warnings == 0 && (ward == null || ward.getCurrentCgpa() == null)) {
            return empty("weekly", "Weekly summary", "No weekly digest is stored, and there is no attendance or warning row to summarize.");
        }
        return ready("weekly", "Weekly summary", SourceClass.HISTORICAL, List.of(
                item("Latest record", attendance.size() + " attendance subject" + (attendance.size() == 1 ? "" : "s"),
                        warnings + " open warning" + (warnings == 1 ? "" : "s") + " for " + who + ". A weekly digest is not generated.")
        ), "This is the latest stored record, not a generated weekly report.", null, null);
    }

    private Map<String, Object> transport(Student student) {
        if (student == null) {
            return unavailable("transport", "Transport", "No student record is stored, so a route cannot be read.");
        }
        List<StudentTransportMapping> mappings = studentTransportRepository.findByStudentId(student.getId());
        if (mappings.isEmpty()) {
            return empty("transport", "Transport", "No route is assigned to this student. The route directory is not shown as a personal bus.");
        }
        StudentTransportMapping mapping = mappings.get(0);
        String route = mapping.getRoute() == null ? "Assigned route" : mapping.getRoute().getRouteName();
        String pickup = mapping.getPickupPoint() == null ? "Pickup not stored" : mapping.getPickupPoint();
        return ready("transport", "Transport", SourceClass.HISTORICAL,
                List.of(item(route, pickup, "Assigned route. Not a live vehicle position.")),
                "Stored student-route mapping.", "/student/transport", "Open transport");
    }

    private Map<String, Object> recommendations(Student student) {
        if (student == null) {
            return unavailable("recommendations", "Personalized recommendations", "No student record is stored.");
        }
        List<Map<String, Object>> items = new ArrayList<>();
        for (PerformanceWarning warning : performanceWarningRepository.findByStudent_IdOrderByAnalyzedAtDesc(student.getId())) {
            if (warning.getIsResolved() != null && warning.getIsResolved()) {
                continue;
            }
            if (warning.getRecommendation() == null || warning.getRecommendation().isBlank()) {
                continue;
            }
            items.add(item("Stored note", warning.getRecommendation(), "From an open performance warning. Not a new recommendation."));
            if (items.size() >= 4) {
                break;
            }
        }
        if (items.isEmpty()) {
            return empty("recommendations", "Personalized recommendations", "No recommendation text is stored for this account. Advice is not generated.");
        }
        return ready("recommendations", "Personalized recommendations", SourceClass.HISTORICAL, items,
                "Stored warning text only. This home does not act on it.", null, null);
    }

    private Map<String, Object> command() {
        Object command = campusStateService.current().get("command");
        if (command instanceof Map<?, ?> raw) {
            @SuppressWarnings("unchecked")
            Map<String, Object> snapshot = (Map<String, Object>) raw;
            return snapshot;
        }
        return Map.of();
    }

    private void addIndicator(List<Map<String, Object>> items, Map<String, Object> command, String key, String label) {
        Object indicators = command.get("indicators");
        if (!(indicators instanceof Map<?, ?> map) || !(map.get(key) instanceof Map<?, ?> row)) {
            return;
        }
        if (row.get("value") == null) {
            items.add(item(label, "Not stored", String.valueOf(row.get("because"))));
            return;
        }
        String unit = row.get("unit") == null ? "" : " " + row.get("unit");
        items.add(item(label, row.get("value") + unit, String.valueOf(row.get("because"))));
    }

    private List<TimetableSlot> today(List<TimetableSlot> slots) {
        String day = LocalDate.now(CAMPUS).getDayOfWeek().name();
        return slots.stream()
                .filter(slot -> day.equalsIgnoreCase(slot.getDayOfWeek()))
                .sorted((left, right) -> String.valueOf(left.getStartTime()).compareTo(String.valueOf(right.getStartTime())))
                .toList();
    }

    private Set<String> assignedSections(User user, List<TimetableSlot> today) {
        Set<String> sections = new LinkedHashSet<>();
        for (TimetableSlot slot : user == null ? List.<TimetableSlot>of() : timetableService.getFacultyTimetable(user.getId())) {
            if (slot.getSection() != null && !slot.getSection().isBlank()) {
                sections.add(slot.getSection().trim());
            }
        }
        if (user != null) {
            facultySubjectRepository.findByFaculty_User_Id(user.getId()).stream()
                    .filter(row -> row.getApprovalStatus() == null || "APPROVED".equalsIgnoreCase(row.getApprovalStatus()))
                    .map(row -> row.getSection())
                    .filter(section -> section != null && !section.isBlank())
                    .forEach(section -> sections.add(section.trim()));
        }
        today.forEach(slot -> {
            if (slot.getSection() != null && !slot.getSection().isBlank()) {
                sections.add(slot.getSection().trim());
            }
        });
        return sections;
    }

    private List<Map<String, Object>> safeAttendance(Long userId) {
        try {
            return erpCoreService.attendanceSummaryForStudent(userId);
        } catch (RuntimeException ex) {
            return List.of();
        }
    }

    private List<Map<String, Object>> safeMarks(Long userId) {
        try {
            return erpCoreService.internalMarksForStudent(userId);
        } catch (RuntimeException ex) {
            return List.of();
        }
    }

    private Student linkedStudent() {
        User user = currentUser().orElse(null);
        if (user == null) {
            return null;
        }
        try {
            return parentService.getAssignedStudent(user.getId());
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private Optional<Student> currentStudent() {
        return currentUser().flatMap(user -> studentRepository.findByUser_Id(user.getId()));
    }

    private Optional<User> currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return Optional.empty();
        }
        return userRepository.findByUsername(auth.getName());
    }

    private static List<String> priorities(String role) {
        return switch (role) {
            case "ADMIN" -> List.of("Campus health", "Digital twin", "Operations", "Predictions", "Alerts", "Simulations", "Decisions");
            case "HOD" -> List.of("Department health", "Student performance", "Attendance", "Subject risk", "Faculty workload", "Placement", "Resource utilization");
            case "FACULTY" -> List.of("Today's classes", "Attendance", "Grading", "At-risk students", "Academic trends", "Workload", "Classroom information");
            case "PARENT" -> List.of("Attendance", "Academic performance", "Fees", "Important alerts", "Weekly summary");
            default -> List.of("Today's schedule", "Attendance", "Academic risk", "Upcoming deadlines", "Campus events", "Transport", "Personalized recommendations");
        };
    }

    private static String displayName(Student student) {
        if (student == null) {
            return "Student";
        }
        if (student.getStudentName() != null && !student.getStudentName().isBlank()) {
            return student.getStudentName();
        }
        if (student.getUser() == null) {
            return "Student";
        }
        String first = student.getUser().getFirstName() == null ? "" : student.getUser().getFirstName();
        String last = student.getUser().getLastName() == null ? "" : student.getUser().getLastName();
        String name = (first + " " + last).trim();
        return name.isBlank() ? "Student" : name;
    }

    private static String subjectName(TimetableSlot slot) {
        if (slot.getSubject() == null) {
            return "Class";
        }
        if (slot.getSubject().getSubjectName() != null && !slot.getSubject().getSubjectName().isBlank()) {
            return slot.getSubject().getSubjectName();
        }
        return slot.getSubject().getSubjectCode() == null ? "Class" : slot.getSubject().getSubjectCode();
    }

    private static String clock(String value) {
        if (value == null || value.length() < 5) {
            return "Time not stored";
        }
        return value.substring(0, 5);
    }

    private static String dayLabel() {
        return LocalDate.now(CAMPUS).getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }

    private static int count(Object value) {
        return value instanceof List<?> rows ? rows.size() : 0;
    }

    private static Map<String, Object> item(String label, String detail, String meta) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("detail", detail);
        row.put("meta", meta);
        return row;
    }

    private static Map<String, Object> ready(String id, String title, SourceClass source, List<Map<String, Object>> items,
                                             String because, String path, String linkLabel) {
        Map<String, Object> row = shell(id, title, "ready", because);
        row.put("source", source.name());
        row.put("items", items);
        if (path != null) {
            row.put("link", Map.of("label", linkLabel, "path", path));
        }
        return row;
    }

    private static Map<String, Object> empty(String id, String title, String because) {
        Map<String, Object> row = shell(id, title, "empty", because);
        row.put("items", List.of());
        return row;
    }

    private static Map<String, Object> unavailable(String id, String title, String because) {
        return unavailable(id, title, because, null, null);
    }

    private static Map<String, Object> unavailable(String id, String title, String because, String path, String linkLabel) {
        Map<String, Object> row = shell(id, title, "unavailable", because);
        row.put("items", List.of());
        if (path != null) {
            row.put("link", Map.of("label", linkLabel, "path", path));
        }
        return row;
    }

    private static Map<String, Object> shell(String id, String title, String status, String because) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("title", title);
        row.put("status", status);
        row.put("because", because);
        return row;
    }

    private static String role() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return "";
        }
        return auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .filter(role -> List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT").contains(role))
                .findFirst()
                .orElse("");
    }
}
