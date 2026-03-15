package com.university.erp.defense;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Detects deviations from baseline: rate spikes, abnormal navigation,
 * rapid repeated operations, unusual paths. Does not disrupt legitimate users.
 */
@Slf4j
@Service
public class AnomalyDetectionService {

    private static final double RATE_SPIKE_MULTIPLIER = 2.5;
    private static final int MIN_BASELINE_RPM = 2;
    private static final int ABSOLUTE_HIGH_RPM = 200;

    private final BehavioralBaselineService baselineService;
    private final AdaptiveDefenseProperties props;

    public AnomalyDetectionService(BehavioralBaselineService baselineService,
                                   AdaptiveDefenseProperties props) {
        this.baselineService = baselineService;
        this.props = props;
    }

    public AnomalyResult evaluate(ClientContext ctx, int currentRequestsInWindow) {
        List<AnomalyType> anomalies = new ArrayList<>();
        String key = ctx.getClientKey();

        BehavioralBaselineService.BaselineSnapshot baseline = baselineService.getBaseline(key);

        if (baseline != null && baseline.getSampleCount() >= props.getBaselineMinSamples()) {
            int baselineRpm = Math.max(baseline.getRequestsPerMinute(), MIN_BASELINE_RPM);
            if (currentRequestsInWindow > baselineRpm * RATE_SPIKE_MULTIPLIER) {
                anomalies.add(AnomalyType.RATE_SPIKE);
            }
            if (currentRequestsInWindow > ABSOLUTE_HIGH_RPM) {
                anomalies.add(AnomalyType.HIGH_ABSOLUTE_RATE);
            }
            String path = normalizePath(ctx.getPath());
            if (!baseline.getPathHistory().isEmpty()) {
                Set<String> knownPaths = baseline.getPathHistory().stream().collect(Collectors.toSet());
                if (!knownPaths.contains(path) && baseline.getPathHistory().size() >= 5) {
                    anomalies.add(AnomalyType.UNUSUAL_PATH);
                }
            }
        } else {
            if (currentRequestsInWindow > props.getRateLimit().getNormalRequestsPerMinute()) {
                anomalies.add(AnomalyType.HIGH_ABSOLUTE_RATE);
            }
        }

        return AnomalyResult.builder()
                .anomalies(anomalies)
                .severity(anomalies.isEmpty() ? 0 : anomalies.stream().mapToInt(AnomalyType::getSeverity).max().orElse(0))
                .build();
    }

    private static String normalizePath(String path) {
        if (path == null) return "";
        int q = path.indexOf('?');
        return q >= 0 ? path.substring(0, q) : path;
    }

    public enum AnomalyType {
        RATE_SPIKE(2),
        HIGH_ABSOLUTE_RATE(3),
        UNUSUAL_PATH(1);

        private final int severity;

        AnomalyType(int severity) {
            this.severity = severity;
        }

        public int getSeverity() {
            return severity;
        }
    }

    @lombok.Value
    @lombok.Builder
    public static class AnomalyResult {
        List<AnomalyType> anomalies;
        int severity;
    }
}
