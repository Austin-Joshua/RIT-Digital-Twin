package com.university.erp.service;

import com.university.erp.dto.IoTSensorTelemetryDto;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.repository.DigitalTwinMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class IoTIngestionGatewayService {

    private final DigitalTwinMetricsRepository metricsRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Fast in-memory cache for ultra-low latency spatial overlays (isolated from DB locks)
    private final Map<String, IoTSensorTelemetryDto> liveTelemetryBuffer = new ConcurrentHashMap<>();

    public Map<String, Object> ingestTelemetry(IoTSensorTelemetryDto telemetry) {
        if (telemetry.getTimestamp() == null) {
            telemetry.setTimestamp(LocalDateTime.now());
        }

        String locationKey = telemetry.getTargetLocation() != null 
                ? telemetry.getTargetLocation().trim().toUpperCase(Locale.ROOT) 
                : "CAMPUS";
        String bufferKey = telemetry.getMetricType() + ":" + locationKey;

        // 1. Update in-memory telemetry buffer
        liveTelemetryBuffer.put(bufferKey, telemetry);

        // 2. Persist to historical DigitalTwinMetrics table for trend analysis
        DigitalTwinMetrics metric = DigitalTwinMetrics.builder()
                .metricType(telemetry.getMetricType())
                .locationCode(locationKey)
                .value(telemetry.getValue())
                .unit(telemetry.getUnit())
                .timestamp(telemetry.getTimestamp())
                .sourceClass(SourceClass.LIVE)
                .isSimulated(false)
                .build();
        metricsRepository.save(metric);

        // 3. Broadcast to WebSocket subscribers for zero-latency 3D map reflection
        try {
            messagingTemplate.convertAndSend("/topic/iot/" + telemetry.getMetricType().toLowerCase(Locale.ROOT), telemetry);
            messagingTemplate.convertAndSend("/topic/campus/telemetry", telemetry);
        } catch (Exception ex) {
            log.debug("WebSocket broadcast skipped or unavailable: {}", ex.getMessage());
        }

        return Map.of(
                "status", "INGESTED",
                "source", SourceClass.LIVE.name(),
                "bufferKey", bufferKey,
                "recordedValue", telemetry.getValue(),
                "timestamp", telemetry.getTimestamp()
        );
    }

    public List<IoTSensorTelemetryDto> getLiveSnapshot() {
        return new ArrayList<>(liveTelemetryBuffer.values());
    }

    public Optional<IoTSensorTelemetryDto> getLatestTelemetry(String metricType, String targetLocation) {
        String key = metricType + ":" + targetLocation.trim().toUpperCase(Locale.ROOT);
        return Optional.ofNullable(liveTelemetryBuffer.get(key));
    }
}
