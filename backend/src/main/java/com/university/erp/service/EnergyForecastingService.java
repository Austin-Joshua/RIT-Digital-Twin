package com.university.erp.service;

import com.university.erp.entity.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnergyForecastingService {

    private final BuildingRepository buildingRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final DigitalTwinMetricsRepository metricsRepository;

    public List<DigitalTwinMetrics> forecastBuildingEnergy(String dayOfWeek) {
        List<Building> buildings = buildingRepository.findAll();
        List<DigitalTwinMetrics> forecasts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Building b : buildings) {
            double baseLoad = b.getBaseEnergyLoad() != null ? b.getBaseEnergyLoad().doubleValue() : 10.0;
            
            // In a real twin, we'd iterate over time buckets. Here we use a sample "Peak Hour" simulation.
            long activeClasses = timetableSlotRepository.findAll().stream()
                    .filter(s -> s.getClassroom() != null && s.getClassroom().getBuilding().getId().equals(b.getId()))
                    .count();

            double forecastValue = baseLoad + (activeClasses * 5.5); // 5.5kW per active classroom

            forecasts.add(metricsRepository.save(DigitalTwinMetrics.builder()
                    .metricType("ENERGY_DEMAND")
                    .locationCode(b.getCode())
                    .value(forecastValue)
                    .unit("kW")
                    .timestamp(now)
                    .isSimulated(true)
                    .build()));
        }
        return forecasts;
    }
}
