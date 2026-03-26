package com.university.erp.service;

import com.university.erp.entity.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceUtilizationService {

    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final DigitalTwinMetricsRepository metricsRepository;

    public List<DigitalTwinMetrics> analyzeResourceUtilization() {
        List<Classroom> classrooms = classroomRepository.findAll();
        List<DigitalTwinMetrics> results = new ArrayList<>();
        
        long totalSlotsPerWeek = 5 * 8; // 5 days, 8 hours/day roughly

        for (Classroom c : classrooms) {
            long allocatedSlots = timetableSlotRepository.findAll().stream()
                    .filter(s -> s.getClassroom() != null && s.getClassroom().getId().equals(c.getId()))
                    .count();

            double utilRate = (double) allocatedSlots / totalSlotsPerWeek;

            results.add(metricsRepository.save(DigitalTwinMetrics.builder()
                    .metricType("RESOURCE_UTIL")
                    .locationCode(c.getName())
                    .value(utilRate * 100) // Percentage
                    .unit("%")
                    .timestamp(java.time.LocalDateTime.now())
                    .isSimulated(false)
                    .build()));
        }
        return results;
    }
}
