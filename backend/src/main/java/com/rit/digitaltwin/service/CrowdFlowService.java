package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.CrowdData;
import com.rit.digitaltwin.repository.CrowdDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CrowdFlowService {

    private final CrowdDataRepository crowdDataRepository;

    public CrowdData recordCurrentDensity(String locationId, int density) {
        String status = density > 80 ? "CRITICAL" : (density > 50 ? "HIGH" : "LOW");
        CrowdData data = CrowdData.builder()
                .locationId(locationId)
                .densityLevel(density)
                .congestionStatus(status)
                .timestamp(LocalDateTime.now())
                .build();
        return crowdDataRepository.save(data);
    }
}
