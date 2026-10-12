package com.university.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IoTSensorTelemetryDto {
    private String deviceId;        // e.g. "TURNSTILE-GATE-1", "ENERGY-METER-MAIN"
    private String metricType;      // "OCCUPANCY", "ENERGY_KW", "TEMPERATURE", "AIR_QUALITY"
    private String targetLocation;   // Building code e.g. "DEMO-MAIN" or Room name e.g. "Room A"
    private Double value;           // Numeric value
    private String unit;            // "count", "kW", "celsius", "AQI"
    private LocalDateTime timestamp;
}
