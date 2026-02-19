package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Building;
import com.rit.digitaltwin.model.EnergyLog;
import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.repository.BuildingRepository;
import com.rit.digitaltwin.repository.EnergyLogRepository;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EnergyService {

    @Autowired
    private EnergyLogRepository energyLogRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private SimulationResultRepository simulationResultRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<EnergyLog> getEnergyLogs(Long buildingId) {
        if (buildingId != null) {
            return energyLogRepository.findByBuilding_BuildingId(buildingId);
        }
        return energyLogRepository.findAll();
    }

    public SimulationResult optimizeEnergy(Long buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new IllegalArgumentException("Building not found"));

        // Mock optimization logic: Project 15% reduction
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("building", building.getBuildingName());
        resultData.put("currentUsageAvg", 500.0); // Mock
        resultData.put("projectedUsage", 425.0); // 15% less
        resultData.put("savings", 75.0);
        resultData.put("solarPotential", 120.0);
        resultData.put("roiMonths", 24);

        SimulationResult result = new SimulationResult();
        result.setSimType(com.rit.digitaltwin.model.SimulationType.ENERGY_FORECAST);
        try {
            result.setParametersJson(objectMapper.writeValueAsString(Map.of("buildingId", buildingId)));
            result.setResultJson(objectMapper.writeValueAsString(resultData));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        return simulationResultRepository.save(result);
    }
}
