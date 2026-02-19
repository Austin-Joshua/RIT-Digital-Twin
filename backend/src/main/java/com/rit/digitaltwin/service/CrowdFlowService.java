package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.CrowdData;
import com.rit.digitaltwin.repository.CrowdDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CrowdFlowService {

    private final CrowdDataRepository crowdDataRepository;
    private final com.rit.digitaltwin.repository.BuildingRepository buildingRepository;

    public CrowdData recordCurrentDensity(String locationId, int density) {
        String status = density > 80 ? "CRITICAL" : (density > 50 ? "HIGH" : "LOW");
        var building = buildingRepository.findByCode(locationId)
                .orElseThrow(() -> new RuntimeException("Building not found: " + locationId));

        CrowdData data = CrowdData.builder()
                .building(building)
                .occupancyCount(density)
                .congestionLevel(status)
                // .timestamp(LocalDateTime.now()) // handled by @CreationTimestamp
                .build();
        return crowdDataRepository.save(data);
    }
}
