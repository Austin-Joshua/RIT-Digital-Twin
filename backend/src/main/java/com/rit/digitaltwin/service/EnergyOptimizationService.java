package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.EnergyLog;
import com.rit.digitaltwin.repository.EnergyLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EnergyOptimizationService {

    private final EnergyLogRepository energyLogRepository;

    public List<EnergyLog> getAllLogs() {
        return energyLogRepository.findAll();
    }

    public Map<String, Object> optimizeEnergyUsage() {
        // Simulation: Assume 15% optimization possible
        return Map.of(
                "currentDailyConsumption", 12000.5,
                "optimizedConsumption", 10200.4,
                "savingsPercentage", "15%",
                "recommendations", List.of("Turn off AC in empty Block A labs", "Switch to Solar in Block C"));
    }
}
