package com.university.erp.service;

import com.university.erp.intelligence.CampusStateNotice;
import com.university.erp.intelligence.ProblemKey;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.util.ErpException;
import com.university.erp.model.AssetInventory;
import com.university.erp.model.CampusAlertState;
import com.university.erp.repository.AssetInventoryRepository;
import com.university.erp.repository.AttendanceRiskRepository;
import com.university.erp.repository.CampusAlertStateRepository;
import com.university.erp.repository.PerformanceWarningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CampusAlertService {

    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");
    private static final Set<String> STATUSES = Set.of("DETECTED", "ACKNOWLEDGED", "INVESTIGATING", "ACTION_TAKEN", "RESOLVED");
    private static final List<String> SEVERITY = List.of("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL");

    private final CampusAlertStateRepository stateRepository;
    private final AttendanceRiskRepository attendanceRiskRepository;
    private final PerformanceWarningRepository performanceWarningRepository;
    private final AssetInventoryRepository assetInventoryRepository;
    private final ApplicationEventPublisher events;

    @Transactional(readOnly = true)
    public Map<String, Object> center(Map<String, Object> command, boolean includeSensitive) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        alerts.addAll(timetableAlerts(command));
        alerts.addAll(crowdModel(command));
        if (includeSensitive) {
            alerts.addAll(academicAlerts());
            alerts.addAll(attendanceAlerts());
            alerts.addAll(maintenanceAlerts());
        }
        alerts.forEach(this::applyStoredStatus);
        alerts.sort(Comparator.comparingInt(row -> SEVERITY.indexOf(String.valueOf(row.get("severity")))));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("alerts", alerts);
        body.put("predictionCards", cards(command));
        body.put("coverage", coverage(includeSensitive));
        body.put("lifecycle", List.copyOf(STATUSES));
        body.put("source", SourceClass.ESTIMATED.name());
        body.put("because", "Alerts are raised only from the timetable, stored risk rows, or a prediction that used stored samples. Empty categories have no model.");
        return body;
    }

    @Transactional
    public Map<String, Object> updateStatus(String key, String status) {
        if (key == null || key.isBlank() || key.length() > 180) {
            throw new ErpException.InvalidOperationException("Alert key is required.");
        }
        String next = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(next)) {
            throw new ErpException.InvalidOperationException("Status must be one of " + STATUSES);
        }
        CampusAlertState row = stateRepository.findByAlertKey(key).orElseGet(CampusAlertState::new);
        row.setAlertKey(key);
        row.setStatus(next);
        row.setUpdatedAt(LocalDateTime.now(CAMPUS));
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        row.setUpdatedBy(auth == null ? null : auth.getName());
        stateRepository.save(row);
        events.publishEvent(new CampusStateNotice("alert-status", SourceClass.ESTIMATED.name(),
                "Alert status changed to " + next + ". This does not change the timetable."));
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("key", key);
        body.put("status", next);
        return body;
    }

    private List<Map<String, Object>> timetableAlerts(Map<String, Object> command) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        Object raw = command.get("alerts");
        if (!(raw instanceof List<?> rows)) {
            return alerts;
        }
        for (Object row : rows) {
            if (!(row instanceof Map<?, ?> source)) {
                continue;
            }
            boolean overflow = source.get("densityPercent") instanceof Number number && number.intValue() > 100;
            String building = text(source, "building", "Room");
            String room = text(source, "room", "room");
            String category = overflow ? "Infrastructure" : "Crowd";
            String key = ProblemKey.of(overflow ? "infrastructure" : "crowd", source.get("buildingId"), source.get("roomId"));
            if (key == null) {
                continue;
            }
            Map<String, Object> alert = base(key, category, overflow ? "HIGH" : "MEDIUM",
                    String.valueOf(source.get("title")),
                    String.valueOf(source.get("why")),
                    building + " · " + room,
                    "Scheduled density " + source.get("densityPercent") + "% of capacity",
                    null,
                    null,
                    String.valueOf(source.get("action")),
                    String.valueOf(source.get("when")),
                    String.valueOf(source.get("impact")),
                    SourceClass.ESTIMATED.name());
            alerts.add(alert);
        }
        return alerts;
    }

    private List<Map<String, Object>> crowdModel(Map<String, Object> command) {
        Map<String, Object> model = model(command, "congestion");
        if (model == null || !Boolean.TRUE.equals(model.get("fromHistory"))) {
            return List.of();
        }
        Object predicted = model.get("predictedAverageDensity");
        if (!(predicted instanceof Number density) || density.doubleValue() < 0.85) {
            return List.of();
        }
        int percent = (int) Math.round(density.doubleValue() * 100);
        Double confidence = model.get("confidenceScore") instanceof Number number ? number.doubleValue() : null;
        return List.of(base("crowd:model:week", "Crowd", percent > 100 ? "HIGH" : "MEDIUM",
                "Stored crowd samples project a tight campus average",
                String.valueOf(model.get("because")),
                "Campus",
                "Latest stored density samples",
                percent + "% planning average",
                confidence,
                String.valueOf(model.get("suggestedAction")),
                "About one week from the sample time. No clock peak is stored.",
                "Average of stored crowd-density samples. No planning margin is added. It is not a door count.",
                SourceClass.PREDICTED.name()));
    }

    private List<Map<String, Object>> academicAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        for (Object[] row : performanceWarningRepository.countOpenByStatus()) {
            if (row[1] == null || !(row[1] instanceof Number number) || number.longValue() == 0) {
                continue;
            }
            String status = row[0] == null ? "Unspecified" : String.valueOf(row[0]);
            String severity = status.toLowerCase(Locale.ROOT).contains("critical") ? "CRITICAL" : "HIGH";
            alerts.add(base("academic:" + status, "Academic risk", severity,
                    number.longValue() + " open academic warning" + (number.longValue() == 1 ? "" : "s") + " marked " + status,
                    "Count of stored performance warnings that are not resolved.",
                    "Academic records",
                    number.longValue() + " open records",
                    null,
                    null,
                    "Review the stored warnings. No student names are included here.",
                    "Stored analysis time. Not a future grade forecast.",
                    "No pass-rate forecast is attached. This is the current stored count.",
                    SourceClass.HISTORICAL.name()));
        }
        return alerts;
    }

    private List<Map<String, Object>> attendanceAlerts() {
        long high = 0;
        for (Object[] row : attendanceRiskRepository.countHighRiskBySection()) {
            if (row[1] instanceof Number number) {
                high += number.longValue();
            }
        }
        if (high == 0) {
            return List.of();
        }
        return List.of(base("attendance:high", "Academic risk", "HIGH",
                high + " stored high attendance-risk record" + (high == 1 ? "" : "s"),
                "Count of students already marked high attendance risk. They are not listed here.",
                "Attendance risk records",
                high + " high-risk records",
                null,
                null,
                "Open attendance analytics. This is not a forecast of who will miss the next class.",
                "Last stored analysis. No next-absence time is predicted.",
                "No absence forecast is stored, so impact is the current count only.",
                SourceClass.HISTORICAL.name()));
    }

    private List<Map<String, Object>> maintenanceAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        for (AssetInventory asset : assetInventoryRepository.findAll()) {
            if (!problemStatus(asset.getStatus())) {
                continue;
            }
            alerts.add(base("maintenance:" + asset.getId(), "Maintenance", "MEDIUM",
                    asset.getAssetName() + " is stored as " + asset.getStatus(),
                    "Status text on the asset record. This is not a failure prediction.",
                    asset.getLocation() == null ? asset.getAssetName() : asset.getLocation(),
                    asset.getStatus(),
                    null,
                    null,
                    "Check the asset record. No work-order forecast is connected.",
                    asset.getLastMaintained() == null ? "No maintenance date stored" : "Last maintained " + asset.getLastMaintained(),
                    "No downtime forecast is stored.",
                    SourceClass.ESTIMATED.name()));
        }
        return alerts;
    }

    private List<Map<String, Object>> cards(Map<String, Object> command) {
        List<Map<String, Object>> cards = new ArrayList<>();
        Object raw = command.get("alerts");
        if (raw instanceof List<?> rows) {
            for (Object row : rows) {
                if (!(row instanceof Map<?, ?> source) || !(source.get("densityPercent") instanceof Number density)) {
                    continue;
                }
                Map<String, Object> card = new LinkedHashMap<>();
                card.put("title", text(source, "building", "Room") + " · " + text(source, "room", "room"));
                card.put("category", density.intValue() > 100 ? "Infrastructure" : "Crowd");
                card.put("current", "In progress".equals(source.get("when")) ? density.intValue() : null);
                card.put("predicted", "In progress".equals(source.get("when")) ? null : density.intValue());
                card.put("peak", source.get("when"));
                card.put("confidence", null);
                card.put("reason", source.get("why"));
                card.put("source", SourceClass.ESTIMATED.name());
                card.put("because", "Timetable density. Confidence is omitted because no model scored this slot.");
                cards.add(card);
            }
        }
        Map<String, Object> model = model(command, "congestion");
        if (model != null && Boolean.TRUE.equals(model.get("fromHistory")) && model.get("predictedAverageDensity") instanceof Number density) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("title", "Campus crowd model");
            card.put("category", "Crowd");
            card.put("current", null);
            card.put("predicted", (int) Math.round(density.doubleValue() * 100));
            card.put("peak", "Not stored");
            card.put("confidence", model.get("confidenceScore"));
            card.put("reason", model.get("because"));
            card.put("source", SourceClass.PREDICTED.name());
            card.put("because", "Existing congestion model. Shown only because stored density samples exist.");
            cards.add(card);
        }
        return cards;
    }

    private List<Map<String, Object>> coverage(boolean includeSensitive) {
        return List.of(
                cover("Crowd", true, "Timetable density is the utilization signal, plus the congestion model only when stored samples exist."),
                cover("Energy", false, "The energy model is a planning baseline, not a campus forecast. No meter threshold is stored."),
                cover("Academic risk", includeSensitive, includeSensitive
                        ? "Open performance warnings and high attendance-risk rows. No future grade or absence model."
                        : "Academic risk counts are limited to admin and HOD."),
                cover("Infrastructure", true, "Raised only when a scheduled class exceeds room capacity."),
                cover("Transport", false, "No demand model and no vehicle positions."),
                cover("Safety", false, "No incident model is connected."),
                cover("Maintenance", includeSensitive, includeSensitive
                        ? "Raised only when an asset status text says it needs work. No failure forecast."
                        : "Asset records are limited to admin and HOD.")
        );
    }

    private void applyStoredStatus(Map<String, Object> alert) {
        String key = String.valueOf(alert.get("key"));
        String status = stateRepository.findByAlertKey(key).map(state -> state.getStatus()).orElse("DETECTED");
        alert.put("status", status);
    }

    private static Map<String, Object> base(String key, String category, String severity, String title, String why,
                                            String entity, String current, String predicted, Double confidence,
                                            String action, String when, String impact, String source) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("key", key);
        ProblemKey parsed = ProblemKey.parse(key);
        row.put("buildingId", parsed == null ? null : parsed.buildingId());
        row.put("roomId", parsed == null ? null : parsed.roomId());
        row.put("category", category);
        row.put("severity", severity);
        row.put("title", title);
        row.put("what", title);
        row.put("why", why);
        row.put("when", when);
        row.put("impact", impact);
        row.put("action", action);
        row.put("affectedEntity", entity);
        row.put("currentState", current);
        row.put("predictedState", predicted);
        row.put("confidence", confidence);
        row.put("recommendedAction", action);
        row.put("timestamp", LocalDateTime.now(CAMPUS).toString());
        row.put("status", "DETECTED");
        row.put("source", source);
        return row;
    }

    private static Map<String, Object> cover(String category, boolean available, String because) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("category", category);
        row.put("available", available);
        row.put("because", because);
        return row;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> model(Map<String, Object> command, String name) {
        Object models = command.get("models");
        if (!(models instanceof Map<?, ?> map)) {
            return null;
        }
        Object model = map.get(name);
        return model instanceof Map<?, ?> row ? (Map<String, Object>) row : null;
    }

    private static String text(Map<?, ?> source, String key, String fallback) {
        Object value = source.get(key);
        return value == null ? fallback : String.valueOf(value);
    }

    private static boolean problemStatus(String status) {
        if (status == null) {
            return false;
        }
        String value = status.toLowerCase(Locale.ROOT);
        return value.contains("repair") || value.contains("broken") || value.contains("fault")
                || value.contains("out of service") || value.contains("maintenance due");
    }
}
