package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Building;
import com.rit.digitaltwin.model.CrowdData;
import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.repository.BuildingRepository;
import com.rit.digitaltwin.repository.CrowdDataRepository;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CrowdService {

    @Autowired
    private CrowdDataRepository crowdDataRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private SimulationResultRepository simulationResultRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<CrowdData> getCrowdData(Long buildingId) {
        if (buildingId != null) {
            return crowdDataRepository.findByBuilding_BuildingId(buildingId);
        }
        return crowdDataRepository.findAll();
    }

    public SimulationResult simulateEvacuation(Long buildingId, int occupancy) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new IllegalArgumentException("Building not found"));

        // Mock simulation logic
        int capacity = building.getTotalCapacity() != 0 ? building.getTotalCapacity() : 500;
        double loadFactor = (double) occupancy / capacity;

        String congestionLevel = "LOW";
        int evacuationTime = 5; // minutes base

        if (loadFactor > 0.9) {
            congestionLevel = "CRITICAL";
            evacuationTime = 25;
        } else if (loadFactor > 0.7) {
            congestionLevel = "HIGH";
            evacuationTime = 15;
        } else if (loadFactor > 0.4) {
            congestionLevel = "MEDIUM";
            evacuationTime = 10;
        }

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("building", building.getBuildingName());
        resultData.put("occupancy", occupancy);
        resultData.put("congestionLevel", congestionLevel);
        resultData.put("estimatedEvacuationTimeMin", evacuationTime);
        resultData.put("readinessScore", Math.max(0, 100 - (evacuationTime * 2)));

        SimulationResult result = new SimulationResult();
        result.setSimType(com.rit.digitaltwin.model.SimulationType.CROWD_FLOW);
        try {
            result.setParametersJson(
                    objectMapper.writeValueAsString(Map.of("buildingId", buildingId, "occupancy", occupancy)));
            result.setResultJson(objectMapper.writeValueAsString(resultData));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        return simulationResultRepository.save(result);
    }
}
