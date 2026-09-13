package com.university.erp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Facade for the simulated source layer. There is no physical IoT feed.
 */
@Service
@RequiredArgsConstructor
public class IoTSimulatorService {

    private final SimulatedSourceService simulatedSourceService;

    public Map<String, Object> current() {
        return simulatedSourceService.snapshot();
    }
}
