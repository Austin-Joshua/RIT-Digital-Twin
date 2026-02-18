package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.TransportRoute;
import com.rit.digitaltwin.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TransportOptimizationService {

    private final TransportRouteRepository routeRepository;

    public List<TransportRoute> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Map<String, Object> analyzeRouteEfficiency() {
        // Simulation
        return Map.of(
                "totalRoutes", routeRepository.count(),
                "efficientRoutes", 12,
                "inefficientRoutes", 3,
                "suggestedMerges", List.of("Route 5 + Route 12", "Route 8 Optimization"));
    }
}
