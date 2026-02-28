package com.university.erp.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class IoTSimulatorService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    public IoTSimulatorService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Simulate Energy Node Data every 3 seconds
    @Scheduled(fixedRate = 3000)
    public void simulateEnergyData() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("mainBlockKw", 120 + random.nextInt(20));
        payload.put("hostelBlockKw", 80 + random.nextInt(15));
        payload.put("libraryKw", 40 + random.nextInt(10));
        payload.put("solarGenerationKw", 50 + random.nextInt(10));
        payload.put("gridImportKw", 190 + random.nextInt(25));
        payload.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/iot/energy", payload);
    }
}
