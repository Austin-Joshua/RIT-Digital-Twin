package com.university.erp.service;

import com.university.erp.intelligence.CampusObservation;
import com.university.erp.intelligence.CrowdProvenance;
import com.university.erp.intelligence.CampusStateNotice;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CrowdFlowService {

    private final TimetableSlotRepository timetableSlotRepository;
    private final CampusRecordQuery campusRecordQuery;
    private final DigitalTwinMetricsRepository metricsRepository;
    private final ApplicationEventPublisher events;

    @Transactional
    public List<DigitalTwinMetrics> simulateCrowdFlow(String dayOfWeek, String timeSlot) {
        String wantedHour = hourPrefix(timeSlot);
        List<TimetableSlot> activeSlots = timetableSlotRepository.findByDayOfWeekIgnoreCase(dayOfWeek).stream()
                .filter(s -> s.getClassroom() != null && wantedHour.equals(hourPrefix(s.getStartTime())))
                .toList();

        Map<String, Long> sectionCounts = new HashMap<>();
        for (Object[] row : campusRecordQuery.countStudentsBySection()) {
            if (row[0] != null) {
                sectionCounts.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
            }
        }

        List<DigitalTwinMetrics> results = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (TimetableSlot slot : activeSlots) {
            Integer capacity = slot.getClassroom().getCapacity();
            if (capacity == null || capacity <= 0) {
                continue;
            }
            long studentCount = sectionCounts.getOrDefault(slot.getSection(), 0L);
            double density = studentCount / (double) capacity;

            CampusObservation observation = new CampusObservation(
                    "ROOM",
                    slot.getClassroom().getName(),
                    "CROWD_DENSITY",
                    density,
                    "ratio",
                    SourceClass.ESTIMATED,
                    "Derived from the timetable and section size for this hour. Not a live sensor and not a historical measurement.");
            results.add(metricsRepository.save(DigitalTwinMetrics.builder()
                    .metricType(observation.metric())
                    .locationCode(observation.locationCode())
                    .value(observation.value())
                    .unit(observation.unit())
                    .timestamp(now)
                    .isSimulated(true)
                    .sourceClass(SourceClass.ESTIMATED)
                    .scenarioName(CrowdProvenance.TIMETABLE_ESTIMATE)
                    .build()));
        }
        events.publishEvent(new CampusStateNotice("crowd-simulation", SourceClass.SIMULATED.name(),
                "Crowd samples were stored from the timetable and section size. Not a live crowd sensor."));
        return results;
    }

    static String hourPrefix(String time) {
        if (time == null || time.isBlank()) {
            return "";
        }
        String trimmed = time.trim();
        int colon = trimmed.indexOf(':');
        String hour = colon > 0 ? trimmed.substring(0, colon) : trimmed;
        if (hour.length() == 1) {
            hour = "0" + hour;
        }
        return hour.length() >= 2 ? hour.substring(0, 2) : hour;
    }
}
