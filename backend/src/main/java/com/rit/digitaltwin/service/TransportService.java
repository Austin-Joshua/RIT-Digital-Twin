package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.model.TransportRoute;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import com.rit.digitaltwin.repository.TransportRouteRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransportService {

    @Autowired
    private TransportRouteRepository routeRepository;

    @Autowired
    private SimulationResultRepository simulationResultRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<TransportRoute> getAllRoutes() {
        return routeRepository.findAll();
    }

    public SimulationResult optimizeRoute(Long routeId) {
        TransportRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        // Mock optimization: Re-route for efficiency
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("route", route.getRouteName());
        resultData.put("originalDistanceKm", 25.0);
        resultData.put("optimizedDistanceKm", 22.5);
        resultData.put("fuelSavingsLitres", 1.5);
        resultData.put("efficiencyScore", 9.2);

        SimulationResult result = new SimulationResult();
        result.setSimType(com.rit.digitaltwin.model.SimulationType.TRANSPORT_OPTIMIZATION);
        try {
            result.setParametersJson(objectMapper.writeValueAsString(Map.of("routeId", routeId)));
            result.setResultJson(objectMapper.writeValueAsString(resultData));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        return simulationResultRepository.save(result);
    }
}
