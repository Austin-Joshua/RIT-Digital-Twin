package com.university.erp.service;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.DigitalTwinMetrics;
import com.university.erp.repository.DigitalTwinMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Time-Series Telemetry Roll-Up & Retention Engine.
 * Prevents relational table bloat by aggregating high-frequency IoT sensor telemetry
 * into 15-minute analytical buckets and pruning raw sensor pings older than retention threshold.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IoTTimeSeriesRollupService {

    private final DigitalTwinMetricsRepository metricsRepository;

    // Fast in-memory cache of 15-minute roll-up windows
    private final Map<String, List<Map<String, Object>>> rollUpBuckets = new ConcurrentHashMap<>();

    /**
     * Executes every 15 minutes: aggregates raw metrics and prunes old data
     */
    @Scheduled(cron = "${rit.iot.rollup.cron:0 0/15 * * * ?}")
    @Transactional
    public void executeRollupAndRetentionJob() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.minusMinutes(15);
        log.info("[IoT-Rollup] Running 15-minute telemetry roll-up for window: {} to {}", windowStart, now);

        try {
            // 1. Fetch raw metrics for the window
            List<DigitalTwinMetrics> recentMetrics = metricsRepository.findByTimestampBetween(windowStart, now);
            if (!recentMetrics.isEmpty()) {
                // Group by metricType + locationCode
                Map<String, List<DigitalTwinMetrics>> grouped = recentMetrics.stream()
                        .filter(m -> m.getValue() != null && m.getLocationCode() != null)
                        .collect(Collectors.groupingBy(m -> m.getMetricType() + ":" + m.getLocationCode()));

                grouped.forEach((key, list) -> {
                    double avg = list.stream().mapToDouble(DigitalTwinMetrics::getValue).average().orElse(0.0);
                    double min = list.stream().mapToDouble(DigitalTwinMetrics::getValue).min().orElse(0.0);
                    double max = list.stream().mapToDouble(DigitalTwinMetrics::getValue).max().orElse(0.0);

                    Map<String, Object> bucket = new LinkedHashMap<>();
                    bucket.put("bucketTime", windowStart.toString());
                    bucket.put("sampleCount", list.size());
                    bucket.put("average", Math.round(avg * 100.0) / 100.0);
                    bucket.put("min", min);
                    bucket.put("max", max);
                    bucket.put("unit", list.get(0).getUnit());
                    bucket.put("source", SourceClass.LIVE.name());

                    rollUpBuckets.computeIfAbsent(key, k -> Collections.synchronizedList(new ArrayList<>())).add(bucket);
                    // Keep at most 96 buckets in-memory (24 hours of 15-min intervals)
                    List<Map<String, Object>> history = rollUpBuckets.get(key);
                    if (history.size() > 96) {
                        history.remove(0);
                    }
                });
                log.info("[IoT-Rollup] Successfully aggregated {} telemetry points across {} locations.", recentMetrics.size(), grouped.size());
            }

            // 2. Data Retention Enforcement: Prune raw LIVE records older than 90 days
            LocalDateTime cutoff = now.minusDays(90);
            int pruned = metricsRepository.deleteOldTelemetry(cutoff, SourceClass.LIVE);
            if (pruned > 0) {
                log.info("[IoT-Retention] Pruned {} raw IoT telemetry records older than 90 days.", pruned);
            }
        } catch (Exception ex) {
            log.error("[IoT-Rollup] Error during roll-up or retention job: {}", ex.getMessage(), ex);
        }
    }

    public List<Map<String, Object>> getRollupFor(String metricType, String locationCode) {
        String key = metricType.toUpperCase(Locale.ROOT) + ":" + locationCode.toUpperCase(Locale.ROOT);
        return rollUpBuckets.getOrDefault(key, List.of());
    }

    public Map<String, Object> getRollupStats() {
        return Map.of(
                "activeStreams", rollUpBuckets.size(),
                "retentionPolicy", "90 Days Raw / Continuous 15-Min Rollups",
                "lastExecution", LocalDateTime.now().toString()
        );
    }
}
