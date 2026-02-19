package com.rit.digitaltwin.service;

import com.rit.digitaltwin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private BuildingRepository buildingRepository;
    @Autowired
    private ClassroomRepository classroomRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalBuildings = buildingRepository.count();
        long totalClassrooms = classroomRepository.count();

        // Mock KPI data - in a real app these would be calculated aggregates
        stats.put("infrastructureUtil", 78.5);
        stats.put("energyOptimization", 85.2);
        stats.put("transportEfficiency", 92.0);
        stats.put("sustainabilityIndex", 88.7);

        stats.put("totalBuildings", totalBuildings);
        stats.put("totalClassrooms", totalClassrooms);

        return stats;
    }
}
