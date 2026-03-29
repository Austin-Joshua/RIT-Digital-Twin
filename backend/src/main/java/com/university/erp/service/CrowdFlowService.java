package com.university.erp.service;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CrowdFlowService {

    private final TimetableSlotRepository timetableSlotRepository;
    private final StudentRepository studentRepository;
    private final DigitalTwinMetricsRepository metricsRepository;

    @Transactional
    public List<DigitalTwinMetrics> simulateCrowdFlow(String dayOfWeek, String timeSlot) {
        List<TimetableSlot> activeSlots = timetableSlotRepository.findAll().stream()
                .filter(s -> s.getDayOfWeek().equalsIgnoreCase(dayOfWeek) && s.getStartTime().startsWith(timeSlot.substring(0, 2)))
                .toList();

        List<DigitalTwinMetrics> results = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (TimetableSlot slot : activeSlots) {
            if (slot.getClassroom() == null) continue;

            long studentCount = studentRepository.countBySection(slot.getSection());
            double capacity = slot.getClassroom().getCapacity() != null ? slot.getClassroom().getCapacity() : 50.0;
            double density = (studentCount / capacity);

            results.add(metricsRepository.save(DigitalTwinMetrics.builder()
                    .metricType("CROWD_DENSITY")
                    .locationCode(slot.getClassroom().getName())
                    .value(density)
                    .unit("ratio")
                    .timestamp(now)
                    .isSimulated(true)
                    .build()));
        }
        return results;
    }
}
