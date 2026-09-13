package com.university.erp.service;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.CampusDecision;
import com.university.erp.repository.CampusDecisionRepository;
import com.university.erp.util.ErpException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CampusDecisionService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");

    private final CampusStateService campusStateService;
    private final CampusAlertService campusAlertService;
    private final ScenarioSimulationService scenarioSimulationService;
    private final CampusDecisionRepository decisionRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> list(boolean includeSensitive) {
        Map<String, Object> center = campusAlertService.center(command(), includeSensitive);
        List<Map<String, Object>> problems = new ArrayList<>();
        Object alerts = center.get("alerts");
        if (alerts instanceof List<?> rows) {
            for (Object row : rows) {
                if (row instanceof Map<?, ?> alert && !"RESOLVED".equals(String.valueOf(alert.get("status")))) {
                    problems.add(problemSummary(alert));
                }
            }
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("source", SourceClass.ESTIMATED.name());
        body.put("replacesCampusState", false);
        body.put("because", "Problems are open stored alerts. Options are estimated only when the existing scenario service can run them. Authorization does not change timetable, doors, or broadcasts.");
        body.put("problems", problems);
        body.put("decisions", decisionRepository.findTop20ByOrderByAuthorizedAtDesc().stream().map(this::stored).toList());
        body.put("flow", List.of("Problem", "Evidence", "Possible actions", "Simulation", "Impact comparison", "Recommendation", "Authorization", "Action", "Outcome"));
        return body;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> review(String key, boolean includeSensitive) {
        Map<String, Object> alert = findAlert(key, includeSensitive);
        String category = String.valueOf(alert.get("category"));
        List<Map<String, Object>> options = optionsFor(category);
        List<Map<String, Object>> estimable = options.stream().filter(option -> Boolean.TRUE.equals(option.get("impactEstimated"))).toList();
        Map<String, Object> preview = estimable.isEmpty() ? Map.of() : scenarioSimulationService.preview(Map.of("scenarios", estimable.stream().map(this::scenario).toList()));
        attachImpact(options, preview);
        Map<String, Object> recommendation = recommend(options, preview);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("source", SourceClass.SIMULATED.name());
        body.put("replacesCampusState", false);
        body.put("because", "Evidence is the stored alert. Impact is a read-only simulation preview. Redirect, corridor, and transition options stay unestimated because those systems are not connected.");
        body.put("problem", problemSummary(alert));
        body.put("evidence", evidence(alert));
        body.put("options", options);
        body.put("recommendation", recommendation);
        body.put("authorization", "Authorizing records a planning choice. It does not change campus systems and is not performed by the copilot.");
        return body;
    }

    @Transactional
    public Map<String, Object> authorize(String key, String optionId, boolean includeSensitive) {
        Map<String, Object> reviewed = review(key, includeSensitive);
        Map<String, Object> chosen = option(reviewed, optionId);
        if (!Boolean.TRUE.equals(chosen.get("impactEstimated"))) {
            throw new ErpException.InvalidOperationException("This option cannot be authorized. No impact was estimated and no campus system can carry it out.");
        }
        CampusDecision row = new CampusDecision();
        row.setProblemKey(key);
        Object problem = reviewed.get("problem");
        row.setProblemTitle(problem instanceof Map<?, ?> map ? String.valueOf(map.get("title")) : key);
        row.setOptionId(optionId);
        row.setOptionLabel(String.valueOf(chosen.get("label")));
        row.setStatus("AUTHORIZED");
        row.setExpectedImpact(String.valueOf(chosen.get("impact")));
        row.setBaselineValue(number(chosen.get("baseline")));
        row.setExpectedValue(number(chosen.get("expected")));
        row.setMetricLabel(chosen.get("metricLabel") == null ? null : String.valueOf(chosen.get("metricLabel")));
        row.setAuthorizedAt(LocalDateTime.now(CAMPUS));
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        row.setAuthorizedBy(auth == null ? null : auth.getName());
        row.setAppliedToCampus(false);
        decisionRepository.save(row);
        Map<String, Object> body = stored(row);
        body.put("replacesCampusState", false);
        body.put("because", "Authorization stored. Timetable, rooms, transport, and broadcasts were not changed.");
        return body;
    }

    @Transactional
    public Map<String, Object> checkOutcome(Long id) {
        CampusDecision row = decisionRepository.findById(id)
                .orElseThrow(() -> new ErpException.InvalidOperationException("Decision was not found."));
        Map<String, Object> preview = scenarioSimulationService.preview(Map.of("scenarios", List.of(
                scenario(Map.of("id", row.getOptionId(), "label", row.getOptionLabel()))
        )));
        Double current = metric(preview.get("current"), "overflowRooms");
        String note = "This record did not change campus systems. Current modeled rooms over capacity: "
                + text(current) + ". Simulated expectation at authorization: " + text(row.getExpectedValue())
                + ". A match is a comparison of records, not proof that this decision caused the change.";
        if (row.getExpectedValue() != null && current != null && Double.compare(current, row.getExpectedValue()) == 0) {
            note = note + " The current record matches the simulated expectation.";
        } else {
            note = note + " The expected result has not been observed in the current timetable record.";
        }
        row.setStatus("OUTCOME_CHECKED");
        row.setOutcomeNote(note);
        row.setOutcomeAt(LocalDateTime.now(CAMPUS));
        row.setAppliedToCampus(false);
        decisionRepository.save(row);
        Map<String, Object> body = stored(row);
        body.put("replacesCampusState", false);
        return body;
    }

    private Map<String, Object> findAlert(String key, boolean includeSensitive) {
        if (key == null || key.isBlank()) {
            throw new ErpException.InvalidOperationException("Problem key is required.");
        }
        Object alerts = campusAlertService.center(command(), includeSensitive).get("alerts");
        if (alerts instanceof List<?> rows) {
            for (Object row : rows) {
                if (row instanceof Map<?, ?> alert && key.equals(String.valueOf(alert.get("key")))) {
                    Map<String, Object> copy = new LinkedHashMap<>();
                    alert.forEach((item, value) -> copy.put(String.valueOf(item), value));
                    return copy;
                }
            }
        }
        throw new ErpException.InvalidOperationException("That problem is not an open stored alert.");
    }

    private List<Map<String, Object>> optionsFor(String category) {
        List<Map<String, Object>> options = new ArrayList<>();
        if ("Crowd".equals(category) || "Infrastructure".equals(category)) {
            options.add(option("reduce-section-size", "Assume 10% smaller sections", true,
                    "Uses the existing intake lever. It does not rewrite enrolment.",
                    Map.of("intakePercent", -10)));
            options.add(option("add-classrooms", "Assume 5 additional classrooms", true,
                    "Uses the existing new-room lever. Added rooms are not placed on the map and do not move today's classes.",
                    Map.of("extraClassrooms", 5, "seatsPerNewClassroom", 60)));
            options.add(reserved("redirect-students", "Redirect students", "No corridor or redirect system is connected, so impact is not estimated."));
            options.add(reserved("open-corridor", "Open additional corridor", "No corridor control is connected, so impact is not estimated."));
            options.add(reserved("adjust-transition", "Adjust transition timing", "No transition schedule can be written, so impact is not estimated."));
            return options;
        }
        if ("Academic risk".equals(category) || "Maintenance".equals(category)) {
            options.add(reserved("review-records", "Review the stored records", "No forecast is stored, so an impact is not estimated. This does not resolve the records."));
            return options;
        }
        options.add(reserved("wait-for-model", "No action is connected", category + " has no decision model. An option is not invented."));
        return options;
    }

    private void attachImpact(List<Map<String, Object>> options, Map<String, Object> preview) {
        Object scenarios = preview.get("scenarios");
        for (Map<String, Object> option : options) {
            if (!Boolean.TRUE.equals(option.get("impactEstimated"))) {
                option.put("impact", "Not estimated");
                option.put("confidence", null);
                continue;
            }
            Map<String, Object> scenario = findScenario(scenarios, String.valueOf(option.get("id")));
            Object deltas = scenario == null ? null : scenario.get("deltas");
            Double baseline = metric(preview.get("current"), "overflowRooms");
            Double expected = baseline;
            Object overflowDelta = deltas instanceof Map<?, ?> map ? map.get("overflowRooms") : null;
            if (baseline != null && overflowDelta instanceof Number number) {
                expected = baseline + number.doubleValue();
            }
            option.put("baseline", baseline);
            option.put("expected", expected);
            option.put("metricLabel", "Rooms over capacity");
            option.put("confidence", null);
            option.put("impact", impactText(deltas, baseline, expected));
            option.put("deltas", deltas);
        }
    }

    private Map<String, Object> recommend(List<Map<String, Object>> options, Map<String, Object> preview) {
        Map<String, Object> body = new LinkedHashMap<>();
        Object raw = preview.get("recommendation");
        String bestId = raw instanceof Map<?, ?> map && map.get("best") != null ? String.valueOf(map.get("best")) : null;
        Map<String, Object> chosen = bestId == null ? null : options.stream()
                .filter(option -> bestId.equals(option.get("id")) && Boolean.TRUE.equals(option.get("impactEstimated")))
                .findFirst().orElse(null);
        body.put("optionId", chosen == null ? null : chosen.get("id"));
        body.put("label", chosen == null ? null : chosen.get("label"));
        body.put("confidence", null);
        body.put("reason", chosen == null
                ? "No option is recommended. Either no impact could be estimated, or the simulated levers do not reduce rooms over capacity or the seat shortfall."
                : "Recommended among options the existing scenario service could score: fewest modeled rooms over capacity, then the smallest seat shortfall. Confidence is not scored. Unestimated options are not recommended.");
        body.put("expectedImpact", chosen == null ? "Not estimated" : chosen.get("impact"));
        body.put("source", SourceClass.SIMULATED.name());
        return body;
    }

    private static String impactText(Object deltas, Double baseline, Double expected) {
        if (!(deltas instanceof Map<?, ?> map) || map.isEmpty()) {
            return "The simulation ran, but no supported metric changed.";
        }
        StringBuilder text = new StringBuilder("Simulated, not campus state. Rooms over capacity: ");
        text.append(text(baseline)).append(" → ").append(text(expected)).append(".");
        if (map.get("crowd") instanceof Number crowd) {
            text.append(" Crowd percent change: ").append(crowd.doubleValue()).append(".");
        }
        if (map.get("resourceDemand") instanceof Number demand) {
            text.append(" Seat shortfall change: ").append(demand.doubleValue()).append(".");
        }
        text.append(" This is not a door count and not a 15-minute peak.");
        return text.toString();
    }

    private Map<String, Object> scenario(Map<String, Object> option) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("name", option.get("id"));
        Object adjustments = option.get("adjustments");
        if (adjustments instanceof Map<?, ?> map) {
            map.forEach((key, value) -> row.put(String.valueOf(key), value));
        } else if ("reduce-section-size".equals(option.get("id"))) {
            row.put("intakePercent", -10);
        } else if ("add-classrooms".equals(option.get("id"))) {
            row.put("extraClassrooms", 5);
            row.put("seatsPerNewClassroom", 60);
        }
        return row;
    }

    private static Map<String, Object> findScenario(Object scenarios, String id) {
        if (!(scenarios instanceof List<?> rows)) {
            return null;
        }
        for (Object row : rows) {
            if (row instanceof Map<?, ?> map && id.equals(String.valueOf(map.get("name")))) {
                Map<String, Object> copy = new LinkedHashMap<>();
                map.forEach((key, value) -> copy.put(String.valueOf(key), value));
                return copy;
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> option(Map<String, Object> reviewed, String optionId) {
        Object options = reviewed.get("options");
        if (options instanceof List<?> rows) {
            for (Object row : rows) {
                if (row instanceof Map<?, ?> map && optionId != null && optionId.equals(String.valueOf(map.get("id")))) {
                    return (Map<String, Object>) map;
                }
            }
        }
        throw new ErpException.InvalidOperationException("Option was not found on this problem.");
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

    private static Map<String, Object> problemSummary(Map<?, ?> alert) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("key", alert.get("key"));
        row.put("title", alert.get("title"));
        row.put("category", alert.get("category"));
        row.put("severity", alert.get("severity"));
        row.put("status", alert.get("status"));
        return row;
    }

    private static List<Map<String, Object>> evidence(Map<String, Object> alert) {
        return List.of(
                fact("What", alert.get("what"), "Stored alert title."),
                fact("Why", alert.get("why"), "Stored explanation. Not a sensor."),
                fact("When", alert.get("when"), "Stored window. A clock peak is included only if the alert already has one."),
                fact("Current", alert.get("currentState"), "Stored current state."),
                fact("Predicted", alert.get("predictedState") == null ? "Not stored" : alert.get("predictedState"), "Shown only when the alert already has a predicted state."),
                fact("Confidence", alert.get("confidence") == null ? "Not scored" : alert.get("confidence"), "Omitted when no model scored the alert.")
        );
    }

    private static Map<String, Object> fact(String label, Object value, String because) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("value", value);
        row.put("because", because);
        return row;
    }

    private static Map<String, Object> option(String id, String label, boolean estimated, String because, Map<String, Object> adjustments) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("label", label);
        row.put("impactEstimated", estimated);
        row.put("executable", false);
        row.put("because", because);
        row.put("adjustments", adjustments);
        return row;
    }

    private static Map<String, Object> reserved(String id, String label, String because) {
        return option(id, label, false, because, Map.of());
    }

    private Map<String, Object> stored(CampusDecision row) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", row.getId());
        body.put("problemKey", row.getProblemKey());
        body.put("problemTitle", row.getProblemTitle());
        body.put("optionId", row.getOptionId());
        body.put("optionLabel", row.getOptionLabel());
        body.put("status", row.getStatus());
        body.put("expectedImpact", row.getExpectedImpact());
        body.put("baselineValue", row.getBaselineValue());
        body.put("expectedValue", row.getExpectedValue());
        body.put("metricLabel", row.getMetricLabel());
        body.put("authorizedBy", row.getAuthorizedBy());
        body.put("authorizedAt", row.getAuthorizedAt() == null ? null : row.getAuthorizedAt().toString());
        body.put("outcomeNote", row.getOutcomeNote());
        body.put("outcomeAt", row.getOutcomeAt() == null ? null : row.getOutcomeAt().toString());
        body.put("appliedToCampus", false);
        body.put("source", SourceClass.SIMULATED.name());
        return body;
    }

    private static Double metric(Object picture, String key) {
        if (!(picture instanceof Map<?, ?> map)) {
            return null;
        }
        Object metric = map.get(key);
        if (metric instanceof Map<?, ?> row && row.get("value") instanceof Number number) {
            return number.doubleValue();
        }
        return null;
    }

    private static Double number(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    private static String text(Object value) {
        return value == null ? "not stored" : String.valueOf(value);
    }
}
