package com.university.erp.defense;

import lombok.Builder;
import lombok.Value;

/**
 * Immutable context for a single request used by adaptive defense.
 * No PII stored in telemetry; clientKey is hashed where needed.
 */
@Value
@Builder
public class ClientContext {
    String clientKey;       // stable key: IP or IP + userId for rate/baseline
    String ipAddress;       // for cooldown/block
    String userId;          // null if anonymous
    String role;             // null if anonymous
    String path;
    String method;
    long timestampMs;
    boolean authenticated;
}
