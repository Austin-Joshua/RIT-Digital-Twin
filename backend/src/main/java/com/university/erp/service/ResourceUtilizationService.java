package com.university.erp.service;

import com.university.erp.intelligence.CampusStateNotice;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResourceUtilizationService {

    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final DigitalTwinMetricsRepository metricsRepository;
    private final ApplicationEventPublisher events;

    @Transactional
    public List<DigitalTwinMetrics> analyzeResourceUtilization() {
        List<Classroom> classrooms = classroomRepository.findAll();
        Map<Long, Long> allocatedByRoom = new HashMap<>();
        for (TimetableSlot slot : timetableSlotRepository.findAllWithClassroom()) {
            if (slot.getClassroom() == null || slot.getClassroom().getId() == null) {
                continue;
            }
            allocatedByRoom.merge(slot.getClassroom().getId(), 1L, (left, right) -> left + right);
        }

        List<DigitalTwinMetrics> results = new ArrayList<>();
        long totalSlotsPerWeek = 5 * 8;

        for (Classroom classroom : classrooms) {
            long allocatedSlots = allocatedByRoom.getOrDefault(classroom.getId(), 0L);
            double utilRate = (double) allocatedSlots / totalSlotsPerWeek;

            results.add(metricsRepository.save(DigitalTwinMetrics.builder()
                    .metricType("RESOURCE_UTIL")
                    .locationCode(classroom.getName())
                    .value(utilRate * 100)
                    .unit("%")
                    .timestamp(java.time.LocalDateTime.now())
                    .isSimulated(false)
                    .sourceClass(SourceClass.ESTIMATED)
                    .build()));
        }
        events.publishEvent(new CampusStateNotice("utilization", SourceClass.ESTIMATED.name(),
                "Room utilization samples were stored from the timetable. Not an occupancy sensor."));
        return results;
    }
}
