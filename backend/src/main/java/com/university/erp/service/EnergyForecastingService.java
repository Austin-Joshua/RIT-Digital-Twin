package com.university.erp.service;

import com.university.erp.intelligence.CampusStateNotice;
import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnergyForecastingService {

    private final BuildingRepository buildingRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final DigitalTwinMetricsRepository metricsRepository;
    private final ApplicationEventPublisher events;

    @Transactional
    public List<DigitalTwinMetrics> forecastBuildingEnergy(String dayOfWeek) {
        List<Building> buildings = buildingRepository.findAll();
        List<TimetableSlot> slots = timetableSlotRepository.findByDayOfWeekIgnoreCase(dayOfWeek);
        List<DigitalTwinMetrics> forecasts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Building building : buildings) {
            if (building.getBaseEnergyLoad() == null) {
                continue;
            }
            long activeClasses = slots.stream()
                    .filter(slot -> belongsTo(slot, building.getId()))
                    .count();
            Double forecastValue = EnergyFormula.kw(building.getBaseEnergyLoad(), activeClasses);
            if (forecastValue == null) {
                continue;
            }

            forecasts.add(metricsRepository.save(DigitalTwinMetrics.builder()
                    .metricType("ENERGY_DEMAND")
                    .locationCode(building.getCode())
                    .value(forecastValue)
                    .unit("kW")
                    .timestamp(now)
                    .isSimulated(true)
                    .sourceClass(SourceClass.SIMULATED)
                    .scenarioName("ENERGY_FORMULA")
                    .build()));
        }
        events.publishEvent(new CampusStateNotice("energy-simulation", SourceClass.SIMULATED.name(),
                "Energy formula samples were stored. Not a meter reading."));
        return forecasts;
    }

    private static boolean belongsTo(TimetableSlot slot, Long buildingId) {
        if (slot.getClassroom() == null || slot.getClassroom().getBuilding() == null || buildingId == null) {
            return false;
        }
        return buildingId.equals(slot.getClassroom().getBuilding().getId());
    }
}
