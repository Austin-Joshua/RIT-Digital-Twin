package com.university.erp.service;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Classroom;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.model.Parent;
import com.university.erp.model.Student;
import com.university.erp.model.TimetableSlot;
import com.university.erp.model.User;
import com.university.erp.repository.AttendanceRiskRepository;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.DigitalTwinMetricsRepository;
import com.university.erp.repository.ParentRepository;
import com.university.erp.repository.PerformanceWarningRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CampusCopilotService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");

    private final CampusStateService campusStateService;
    private final CampusAlertService campusAlertService;
    private final PredictiveEngine predictiveEngine;
    private final ScenarioSimulationService scenarioSimulationService;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final AttendanceRiskRepository attendanceRiskRepository;
    private final PerformanceWarningRepository performanceWarningRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final DigitalTwinMetricsRepository metricsRepository;
    private final CampusDecisionService campusDecisionService;

    @Transactional(readOnly = true)
    public Map<String, Object> briefing(String page, String entity) {
        String role = role();
        String path = page == null ? "" : page;
        List<Map<String, Object>> actions = new ArrayList<>();
        String text;
        if (operational(role) && campusPage(path)) {
            text = campusBrief(role, actions);
        } else if (path.contains("simulation")) {
            text = "The simulation lab changes assumed intake, rooms, timetable load, HVAC formula, and bus seats. Its output is simulated and does not replace campus state.";
            view(actions, role, "SIMULATE", "Open simulation lab", simulationPath(role));
        } else if (path.contains("energy")) {
            text = "The energy page uses the stored formula, base load plus 5.5 kW per class. No meter series is connected, so an increase cannot be proven from this page.";
            view(actions, role, "VIEW", "Open energy formula", "/simulations/energy");
        } else {
            text = "Ask about campus state, a timetable hour, stored energy samples, or academic records this role can see. If a record is missing, the answer will say so.";
        }
        if (entity != null && !entity.isBlank() && operational(role)) {
            text = text + " Selected entity: " + entity.trim() + ".";
        }
        return answer(text, actions, "Briefing uses the current role and page. It does not invent a campus event.");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> ask(String query, String page, String entity) {
        String role = role();
        String text = query == null ? "" : query.trim();
        String lower = text.toLowerCase(Locale.ROOT);
        if (text.isBlank()) {
            return briefing(page, entity);
        }
        if (lower.contains("academic risk") || lower.contains("at risk") || lower.contains("which students")) {
            return academicRisk(role, lower);
        }
        if ((lower.contains("available") || lower.contains("free")) && (lower.contains("classroom") || lower.contains("room"))) {
            return availability(text);
        }
        if (lower.contains("energy")) {
            return energy(lower);
        }
        if (lower.contains("happening") || lower.contains("what is going on")) {
            return answer(campusBrief(role, new ArrayList<>()), pageActions(role), "Campus state from the current timetable snapshot.");
        }
        if (lower.contains("crowded") || lower.contains("congestion") || lower.contains("why is") || lower.contains("block ")) {
            return crowd(role, text, entity);
        }
        if (lower.contains("compare") || lower.contains("scenario") || lower.contains("simulation")) {
            return compare(role);
        }
        if (lower.contains("decision") || lower.contains("recommend") || lower.contains("authoriz")) {
            return decisions(role);
        }
        if (lower.contains("predict") || lower.contains("forecast")) {
            return predictions(role);
        }
        if (lower.equals("why") || lower.equals("why?") || lower.startsWith("explain")) {
            return explain(role);
        }
        if (lower.contains("report")) {
            List<Map<String, Object>> actions = new ArrayList<>();
            view(actions, role, "VIEW", "Open analytics", "/analytics");
            return answer("A generated campus report is not connected. I will not create one from estimated figures."
                    + (actions.isEmpty() ? "" : " The existing analytics page can be opened instead."), actions, "No report writer is connected.");
        }
        if (lower.contains("alert") || lower.contains("campus state") || lower.contains("anomaly")) {
            return answer(campusBrief(role, new ArrayList<>()), pageActions(role), "Campus state from the current timetable snapshot.");
        }
        return unavailable(role, text);
    }

    private Map<String, Object> academicRisk(String role, String lower) {
        if ("STUDENT".equals(role)) {
            return ownRisk(currentStudent(), "your");
        }
        if ("PARENT".equals(role)) {
            Parent parent = currentUser().flatMap(user -> parentRepository.findByUser_Id(user.getId())).orElse(null);
            if (parent == null || parent.getStudent() == null) {
                return answer("No linked student is stored for this parent login, so academic risk cannot be read.", List.of(), "Parent record has no student.");
            }
            return ownRisk(Optional.of(parent.getStudent()), "the linked student's");
        }
        if (!("ADMIN".equals(role) || "HOD".equals(role))) {
            List<Map<String, Object>> actions = new ArrayList<>();
            view(actions, role, "VIEW", "Open class risk", "/faculty/risk-heatmap");
            return answer("Student-wide academic risk counts are limited to admin and HOD. Faculty can open the class risk page. Names are not listed here.", actions, "Role restriction.");
        }
        long warnings = performanceWarningRepository.countOpenByStatus().stream()
                .mapToLong(row -> row[1] instanceof Number number ? number.longValue() : 0).sum();
        long highAttendance = attendanceRiskRepository.countHighRiskBySection().stream()
                .mapToLong(row -> row[1] instanceof Number number ? number.longValue() : 0).sum();
        if (warnings == 0 && highAttendance == 0) {
            return answer("No open performance warnings and no high attendance-risk rows are stored. That is the current record, not a forecast of who will struggle.", List.of(), "Stored academic rows are empty.");
        }
        return answer(warnings + " open performance warning" + (warnings == 1 ? "" : "s") + " and "
                + highAttendance + " high attendance-risk record" + (highAttendance == 1 ? "" : "s")
                + " are stored. Student names are not included here. This is not a future grade forecast.",
                List.of(), "Counts only. No names.");
    }

    private Map<String, Object> ownRisk(Optional<Student> student, String who) {
        if (student.isEmpty()) {
            return answer("No student record is stored for this login, so academic risk cannot be read.", List.of(), "Student record missing.");
        }
        var attendance = attendanceRiskRepository.findByStudent_IdOrderByAnalyzedAtDesc(student.get().getId());
        var warnings = performanceWarningRepository.findByStudent_IdOrderByAnalyzedAtDesc(student.get().getId()).stream()
                .filter(row -> row.getIsResolved() == null || !row.getIsResolved()).toList();
        if (attendance.isEmpty() && warnings.isEmpty()) {
            return answer("No attendance-risk or performance-warning row is stored for " + who + " account. A risk level is not invented.", List.of(), "No stored risk row.");
        }
        String latest = attendance.isEmpty() ? "no attendance-risk row" : "latest attendance risk " + attendance.get(0).getRiskLevel();
        return answer("Stored records for " + who + " account: " + latest + ", and " + warnings.size() + " open performance warning"
                + (warnings.size() == 1 ? "" : "s") + ". Other students are not listed.", List.of(), "Own stored rows only.");
    }

    private Map<String, Object> availability(String query) {
        LocalDate day = dayFrom(query);
        LocalTime parsedTime = timeFrom(query);
        boolean clockNow = parsedTime == null;
        LocalTime targetTime = parsedTime != null ? parsedTime : LocalTime.now(CAMPUS);
        String dayName = day.getDayOfWeek().name();
        List<TimetableSlot> slots = timetableSlotRepository.findByDayOfWeekIgnoreCase(dayName);
        String when = day.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                + (clockNow ? " at the current campus clock (" + targetTime.withNano(0) + ")" : " at " + targetTime);
        if (slots.isEmpty()) {
            return answer("No timetable slots are stored for " + when + ". Free rooms are not inferred from an empty day.", List.of(), "No slots for that day.");
        }
        List<Long> busy = new ArrayList<>();
        for (TimetableSlot slot : slots) {
            if (slot.getClassroom() == null || slot.getClassroom().getId() == null) {
                continue;
            }
            if (covers(slot, targetTime)) {
                busy.add(slot.getClassroom().getId());
            }
        }
        List<String> free = new ArrayList<>();
        int total = 0;
        for (Classroom room : classroomRepository.findAllWithBuilding()) {
            total++;
            if (room.getId() != null && busy.contains(room.getId())) {
                continue;
            }
            String building = room.getBuilding() == null ? "Unassigned building" : room.getBuilding().getName();
            free.add(building + " · " + room.getName());
        }
        if (total == 0) {
            return answer("No classrooms are stored, so availability cannot be answered.", List.of(), "Classroom table is empty.");
        }
        if (free.isEmpty()) {
            return answer("Every stored classroom has a timetable slot covering " + when + ". This is the timetable, not a live booking board.", List.of(), "All stored rooms are booked in that hour.");
        }
        List<String> shown = free.stream().limit(8).toList();
        String more = free.size() > shown.size() ? " " + (free.size() - shown.size()) + " more are also free." : "";
        List<Map<String, Object>> actions = new ArrayList<>();
        view(actions, role(), "VIEW", "Open classrooms", "/classrooms/allocation");
        return answer(free.size() + " of " + total + " stored classrooms have no timetable slot at " + when + ": "
                + String.join(", ", shown) + "." + more + " Section sizes are not included.", actions, "Timetable overlap only.");
    }

    private Map<String, Object> energy(String lower) {
        List<DigitalTwinMetrics> samples = metricsRepository.findTop50ByMetricTypeOrderByTimestampDesc("ENERGY_DEMAND").stream()
                .filter(sample -> sample.getScenarioName() == null || sample.getScenarioName().isBlank())
                .filter(sample -> sample.getValue() != null)
                .toList();
        if (lower.contains("unavailable") || lower.contains("available")) {
            return energyAvailability();
        }
        if (lower.contains("increase") || lower.contains("higher") || lower.contains("rise")) {
            if (samples.size() < 2) {
                return answer("Energy usage cannot be said to have increased. Fewer than two stored formula samples exist, and no meter is connected.", List.of(), "No energy history to compare.");
            }
            double latest = samples.get(0).getValue();
            double previous = samples.get(1).getValue();
            if (latest <= previous) {
                return answer("The latest stored energy formula sample (" + round(latest) + " kW) is not higher than the previous stored sample ("
                        + round(previous) + " kW). These are formula samples, not a meter.", List.of(), "Stored samples do not show an increase.");
            }
            return answer("The latest stored formula sample is " + round(latest) + " kW, above the previous stored sample of " + round(previous)
                    + " kW. The formula is base load plus 5.5 kW per class. A cause beyond that is not stored, and this is not a meter reading.",
                    List.of(), "Compared two stored ENERGY_DEMAND samples.");
        }
        Map<String, Object> state = operational(role()) ? campusStateService.current() : Map.of();
        Object energy = state.get("energy");
        if (energy instanceof Map<?, ?> row && row.get("demandKw") != null) {
            return answer("Current formula demand is " + row.get("demandKw") + " kW. " + row.get("because"), List.of(), "Campus state energy formula.");
        }
        return answer("No current energy formula total is stored, and no meter is connected.", List.of(), "Energy field empty.");
    }

    private Map<String, Object> energyAvailability() {
        if (!operational(role())) {
            return answer("Building energy is limited to admin, HOD, and faculty. A load is not estimated for this role.", List.of(), "Role restriction.");
        }
        Map<String, Object> command = command();
        Object buildings = command.get("buildings");
        if (!(buildings instanceof List<?> rows) || rows.isEmpty()) {
            return answer("No buildings are stored, so energy is unavailable.", List.of(), "Building table is empty.");
        }
        List<String> available = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (Object row : rows) {
            if (!(row instanceof Map<?, ?> building)) {
                continue;
            }
            String name = String.valueOf(building.get("name"));
            if (building.get("energyKw") == null) {
                missing.add(name);
            } else {
                available.add(name + " " + building.get("energyKw") + " kW (" + building.get("energySource") + ")");
            }
        }
        String text = "Energy is a stored formula, not a meter. "
                + (available.isEmpty() ? "No building has a stored base load." : "Available: " + String.join("; ", available) + ".")
                + (missing.isEmpty() ? "" : " Unavailable, not zero: " + String.join(", ", missing) + ".");
        return answer(text, List.of(), "Stored base load plus the class term, per building.");
    }

    private Map<String, Object> crowd(String role, String query, String entity) {
        if (!operational(role)) {
            return answer("Building crowd and timetable density are limited to admin, HOD, and faculty. A crowd level is not estimated for this role.", List.of(), "Role restriction.");
        }
        Map<String, Object> command = command();
        String needle = entityNeedle(query, entity);
        List<Map<String, Object>> matches = matchBuildings(command, needle);
        if (needle.isBlank()) {
            return answer("Name the building, for example Block B. No building crowd is assumed.", List.of(), "Building was not named.");
        }
        if (matches.isEmpty()) {
            return answer("No stored building matches \"" + needle + "\". Seeded names that are not in the building table are not treated as crowded.", List.of(), "No building match.");
        }
        if (matches.size() > 1) {
            String names = matches.stream().map(row -> String.valueOf(row.get("name"))).reduce((a, b) -> a + ", " + b).orElse("");
            return answer("More than one stored building matches. Ask again with one of: " + names + ".", List.of(), "Ambiguous building name.");
        }
        Map<String, Object> building = matches.get(0);
        String name = String.valueOf(building.get("name"));
        Object peak = building.get("peakDensity");
        String density = peak instanceof Number number ? Math.round(number.doubleValue() * 100) + "%" : "not stored";
        StringBuilder why = new StringBuilder();
        why.append(name).append(" scheduled peak density is ").append(density).append(". This is section size against room capacity, not a door count.");
        Object rooms = building.get("rooms");
        if (rooms instanceof List<?> rows) {
            List<String> tight = new ArrayList<>();
            for (Object row : rows) {
                if (row instanceof Map<?, ?> room && room.get("density") instanceof Number number && number.doubleValue() >= 0.85) {
                    tight.add(String.valueOf(room.get("name")) + " at " + Math.round(number.doubleValue() * 100) + "%");
                }
            }
            if (tight.isEmpty()) {
                why.append(" No room in this building is at or above 85% of capacity in the current timetable window.");
            } else {
                why.append(" Contributors at or above 85%: ").append(String.join(", ", tight.stream().limit(5).toList())).append(".");
            }
        }
        Map<String, Object> prediction = predictiveEngine.predictNextWeekTrends();
        if (Boolean.TRUE.equals(prediction.get("fromHistory"))) {
            why.append(" The campus congestion model used stored samples and projects ")
                    .append(percent(prediction.get("predictedAverageDensity")))
                    .append(" as a campus average, not this building's clock peak.");
        } else {
            why.append(" No stored density history exists, so a building prediction is not added.");
        }
        why.append(" Recommended action: check the section against the room. No corridor sensor can redirect people.");
        List<Map<String, Object>> actions = new ArrayList<>();
        view(actions, role, "VIEW", "View " + name, mapPath(role));
        view(actions, role, "VIEW", "Why on the alert center", campusPath(role) + "?step=alerts");
        view(actions, role, "SIMULATE", "Simulate", simulationPath(role));
        return answer(why.toString(), actions, "Timetable density for a matched stored building.");
    }

    private Map<String, Object> compare(String role) {
        if (!"ADMIN".equals(role) && !"HOD".equals(role)) {
            return answer("Scenario comparison is limited to admin and HOD. This role cannot run or store a campus simulation.", List.of(), "Role restriction.");
        }
        Map<String, Object> preview = scenarioSimulationService.preview(Map.of("scenarios", List.of(
                Map.of("name", "Scenario A", "intakePercent", 20),
                Map.of("name", "Scenario B", "intakePercent", 20, "extraClassrooms", 5, "seatsPerNewClassroom", 60),
                Map.of("name", "Scenario C", "intakePercent", 20, "extraClassrooms", 5, "seatsPerNewClassroom", 60, "busCapacityPercent", 20)
        )));
        Object recommendation = preview.get("recommendation");
        String why = recommendation instanceof Map<?, ?> row ? String.valueOf(row.get("why")) : "The comparison did not return a recommendation.";
        String best = recommendation instanceof Map<?, ?> row && row.get("best") != null ? String.valueOf(row.get("best")) : "No scenario is better on timetable pressure";
        List<Map<String, Object>> actions = new ArrayList<>();
        view(actions, role, "COMPARE", "Open comparison", simulationPath(role));
        view(actions, role, "SIMULATE", "Simulate", simulationPath(role));
        return answer(best + ". " + why + " This preview was not saved and is not campus state.", actions, "Read-only preview of the existing scenario service.");
    }

    private Map<String, Object> decisions(String role) {
        if (!operational(role)) {
            return answer("Planning decisions are limited to admin, HOD, and faculty. The copilot cannot authorize a choice.", List.of(), "Role restriction.");
        }
        Map<String, Object> board = campusDecisionService.list("ADMIN".equals(role) || "HOD".equals(role));
        Object rows = board.get("decisions");
        String because = String.valueOf(board.getOrDefault("because", "Stored planning records."));
        if (!(rows instanceof List<?> decisions) || decisions.isEmpty()) {
            return answer("No planning decision is stored. The copilot cannot authorize one.", List.of(), because);
        }
        Object first = decisions.get(0);
        String detail = first instanceof Map<?, ?> row
                ? String.valueOf(row.get("status")) + " · " + row.get("optionLabel") + " · appliedToCampus=" + row.get("appliedToCampus")
                : "A stored planning record exists.";
        List<Map<String, Object>> actions = new ArrayList<>();
        if ("ADMIN".equals(role) || "HOD".equals(role)) {
            view(actions, role, "VIEW", "Open decisions", campusPath(role) + "?step=decisions");
        }
        return answer("Stored planning records: " + decisions.size() + ". Latest: " + detail
                + ". Authorization is a human action. The copilot does not authorize or apply a decision to campus.",
                actions, because);
    }

    private Map<String, Object> predictions(String role) {
        if (!operational(role)) {
            return answer("Campus predictions are limited to admin, HOD, and faculty.", List.of(), "Role restriction.");
        }
        Map<String, Object> crowd = predictiveEngine.predictNextWeekTrends();
        String text = Boolean.TRUE.equals(crowd.get("fromHistory"))
                ? "The congestion model used stored density samples. " + crowd.get("because")
                : "No crowd-density history is stored, so a congestion prediction is not treated as intelligence. The energy planning baseline is also not a forecast.";
        List<Map<String, Object>> actions = new ArrayList<>();
        if ("ADMIN".equals(role)) {
            view(actions, role, "VIEW", "Open predictions", "/predictions");
        } else {
            view(actions, role, "VIEW", "Open sources", campusPath(role) + "?step=sources");
        }
        return answer(text, actions, "Existing prediction map. No invented series.");
    }

    private String campusBrief(String role, List<Map<String, Object>> actions) {
        if (!operational(role)) {
            return "Campus operating state is limited to admin, HOD, and faculty.";
        }
        Map<String, Object> command = command();
        boolean sensitive = "ADMIN".equals(role) || "HOD".equals(role);
        Map<String, Object> center = campusAlertService.center(command, sensitive);
        Object alerts = center.get("alerts");
        int open = 0;
        if (alerts instanceof List<?> rows) {
            open = (int) rows.stream().filter(row -> row instanceof Map<?, ?> map && !"RESOLVED".equals(map.get("status"))).count();
        }
        view(actions, role, "VIEW", "Open alert center", campusPath(role) + "?step=alerts");
        view(actions, role, "VIEW", "View campus", mapPath(role));
        view(actions, role, "SIMULATE", "Open simulation", simulationPath(role));
        if ("ADMIN".equals(role) || "HOD".equals(role)) {
            view(actions, role, "VIEW", "Open decisions", campusPath(role) + "?step=decisions");
        }
        if (open == 0) {
            return "No open alert is stored from the timetable, and academic or maintenance rows did not cross a threshold this role can see.";
        }
        String detail = "";
        if (alerts instanceof List<?> rows) {
            for (Object row : rows) {
                if (row instanceof Map<?, ?> map && !"RESOLVED".equals(String.valueOf(map.get("status")))) {
                    detail = " " + map.get("title") + " " + map.get("why");
                    break;
                }
            }
        }
        return open + " open alert" + (open == 1 ? " is" : "s are")
                + " stored. They are estimates from the timetable or stored records, not a sensor event." + detail;
    }

    private Map<String, Object> unavailable(String role, String query) {
        List<Map<String, Object>> actions = pageActions(role);
        return answer("I don't have a stored answer for that. I will not invent institutional numbers. Ask about a named building, a classroom hour, stored energy samples, academic risk this role can see, or a scenario comparison.",
                actions, "No matching record for: " + query);
    }

    private List<Map<String, Object>> pageActions(String role) {
        List<Map<String, Object>> actions = new ArrayList<>();
        if ("ADMIN".equals(role)) {
            view(actions, role, "VIEW", "Open predictions", "/predictions");
        } else {
            view(actions, role, "VIEW", "Open sources", campusPath(role) + "?step=sources");
        }
        view(actions, role, "SIMULATE", "Simulate", simulationPath(role));
        return actions;
    }

    private Map<String, Object> explain(String role) {
        if (!operational(role)) {
            return answer("There is no campus alert list for this role, so there is nothing further to explain.", List.of(), "Role restriction.");
        }
        Map<String, Object> center = campusAlertService.center(command(), "ADMIN".equals(role) || "HOD".equals(role));
        Object alerts = center.get("alerts");
        if (!(alerts instanceof List<?> rows) || rows.isEmpty()) {
            return answer("Nothing is open to explain. No stored condition crossed a threshold for this role.", List.of(), "Alert list empty.");
        }
        StringBuilder text = new StringBuilder("Stored open conditions:");
        int shown = 0;
        for (Object row : rows) {
            if (!(row instanceof Map<?, ?> alert) || "RESOLVED".equals(alert.get("status")) || shown >= 5) {
                continue;
            }
            shown++;
            text.append(" ").append(alert.get("title")).append(" — ").append(alert.get("why"));
        }
        if (shown == 0) {
            return answer("Stored alerts are marked resolved. No open condition remains to explain.", List.of(), "All resolved.");
        }
        List<Map<String, Object>> actions = new ArrayList<>();
        view(actions, role, "VIEW", "Open alert center", campusPath(role) + "?step=alerts");
        return answer(text.toString(), actions, "Alert titles already stored. No new inference.");
    }

    private Map<String, Object> command() {
        Object command = campusStateService.current().get("command");
        if (command instanceof Map<?, ?> map) {
            Map<String, Object> copy = new LinkedHashMap<>();
            map.forEach((key, value) -> copy.put(String.valueOf(key), value));
            return copy;
        }
        return Map.of();
    }

    private List<Map<String, Object>> matchBuildings(Map<String, Object> command, String needle) {
        List<Map<String, Object>> matches = new ArrayList<>();
        Object buildings = command.get("buildings");
        if (!(buildings instanceof List<?> rows) || needle.isBlank()) {
            return matches;
        }
        String wanted = needle.toLowerCase(Locale.ROOT);
        for (Object row : rows) {
            if (!(row instanceof Map<?, ?> building)) {
                continue;
            }
            String name = String.valueOf(building.get("name") == null ? "" : building.get("name")).toLowerCase(Locale.ROOT);
            String code = String.valueOf(building.get("code") == null ? "" : building.get("code")).toLowerCase(Locale.ROOT);
            String id = String.valueOf(building.get("id") == null ? "" : building.get("id"));
            if (id.equals(wanted) || name.contains(wanted) || code.equals(wanted) || wanted.contains(name) && name.length() > 2) {
                Map<String, Object> copy = new LinkedHashMap<>();
                building.forEach((key, value) -> copy.put(String.valueOf(key), value));
                matches.add(copy);
            }
        }
        return matches;
    }

    private static String entityNeedle(String query, String entity) {
        if (entity != null && !entity.isBlank()) {
            java.util.regex.Matcher buildingId = java.util.regex.Pattern.compile("(?i)^building:(\\d+)$").matcher(entity.trim());
            if (buildingId.matches()) {
                return buildingId.group(1);
            }
            return entity.trim();
        }
        String lower = query.toLowerCase(Locale.ROOT);
        int block = lower.indexOf("block ");
        if (block >= 0) {
            String rest = query.substring(block).replaceAll("[?.!,].*$", "").trim();
            return rest;
        }
        return "";
    }

    private static LocalDate dayFrom(String query) {
        String lower = query.toLowerCase(Locale.ROOT);
        LocalDate today = LocalDate.now(CAMPUS);
        if (lower.contains("tomorrow")) {
            return today.plusDays(1);
        }
        for (DayOfWeek day : DayOfWeek.values()) {
            if (lower.contains(day.name().toLowerCase(Locale.ROOT)) || lower.contains(day.getDisplayName(TextStyle.FULL, Locale.ENGLISH).toLowerCase(Locale.ROOT))) {
                return today.with(day);
            }
        }
        return today;
    }

    private static LocalTime timeFrom(String query) {
        String lower = query.toLowerCase(Locale.ROOT);
        java.util.regex.Matcher clock = java.util.regex.Pattern.compile("(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?").matcher(lower);
        while (clock.find()) {
            int hour = Integer.parseInt(clock.group(1));
            int minute = clock.group(2) == null ? 0 : Integer.parseInt(clock.group(2));
            String suffix = clock.group(3);
            if (hour > 23 || minute > 59) {
                continue;
            }
            if ("pm".equals(suffix) && hour < 12) {
                hour += 12;
            }
            if ("am".equals(suffix) && hour == 12) {
                hour = 0;
            }
            if (suffix == null && hour < 7) {
                hour += 12;
            }
            return LocalTime.of(hour, minute);
        }
        return null;
    }

    private static boolean covers(TimetableSlot slot, LocalTime time) {
        LocalTime start = CampusCommandService.parseTime(slot.getStartTime());
        LocalTime end = CampusCommandService.parseTime(slot.getEndTime());
        return start != null && end != null && !time.isBefore(start) && time.isBefore(end);
    }

    private static String campusPath(String role) {
        if ("HOD".equals(role)) {
            return "/hod/twin";
        }
        if ("FACULTY".equals(role)) {
            return "/faculty/twin";
        }
        return "/";
    }

    private static String mapPath(String role) {
        if ("HOD".equals(role)) {
            return "/hod/map";
        }
        if ("FACULTY".equals(role)) {
            return "/faculty/map";
        }
        return "/map";
    }

    private static String simulationPath(String role) {
        if ("HOD".equals(role)) {
            return "/hod/simulation";
        }
        if ("FACULTY".equals(role)) {
            return null;
        }
        return "/simulations";
    }

    private static boolean campusPage(String path) {
        return "/".equals(path) || path.startsWith("/map") || path.contains("/map") || path.contains("prediction") || path.contains("/twin");
    }

    private void view(List<Map<String, Object>> actions, String role, String kind, String label, String path) {
        if (path == null || !allowed(role, path)) {
            return;
        }
        Map<String, Object> action = new LinkedHashMap<>();
        action.put("kind", kind);
        action.put("label", label);
        action.put("path", path);
        action.put("executes", false);
        actions.add(action);
    }

    private static boolean allowed(String role, String path) {
        if ("ADMIN".equals(role)) {
            return true;
        }
        if ("FACULTY".equals(role)) {
            return path.startsWith("/faculty");
        }
        if ("STUDENT".equals(role)) {
            return path.startsWith("/student");
        }
        if ("PARENT".equals(role)) {
            return path.startsWith("/parent");
        }
        return "HOD".equals(role) && path.startsWith("/hod");
    }

    private Optional<User> currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return Optional.empty();
        }
        return userRepository.findByUsername(auth.getName());
    }

    private Optional<Student> currentStudent() {
        return currentUser().flatMap(user -> studentRepository.findByUser_Id(user.getId()));
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

    private static boolean operational(String role) {
        return "ADMIN".equals(role) || "HOD".equals(role) || "FACULTY".equals(role);
    }

    private static String percent(Object value) {
        if (!(value instanceof Number number)) {
            return "not stored";
        }
        double raw = number.doubleValue();
        return Math.round((raw <= 1 ? raw * 100 : raw)) + "%";
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static Map<String, Object> answer(String text, List<Map<String, Object>> actions, String because) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("answer", text);
        body.put("actions", actions);
        body.put("source", SourceClass.ESTIMATED.name());
        body.put("because", because);
        body.put("hallucinated", false);
        return body;
    }
}
