package com.university.erp.defense;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Applies proportional countermeasures: throttling, delayed response,
 * selective blocking. Stealthy: no explicit warning to attackers,
 * consistent response behavior, minimal information leakage.
 */
@Slf4j
@Service
public class CountermeasureExecutor {

    private final AdaptiveDefenseProperties props;
    private final AdaptiveRateController rateController;
    private final SecurityTelemetryService telemetry;

    public CountermeasureExecutor(AdaptiveDefenseProperties props,
                                  AdaptiveRateController rateController,
                                  SecurityTelemetryService telemetry) {
        this.props = props;
        this.rateController = rateController;
        this.telemetry = telemetry;
    }

    /**
     * Apply countermeasure for high-risk client. Stealthy: use 503 for block
     * so it appears as service overload, not "you are blocked".
     */
    public boolean applyCountermeasure(ClientContext ctx, RiskLevel level,
                                       HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (level == RiskLevel.LOW || level == RiskLevel.MEDIUM) {
            return false;
        }

        if (level == RiskLevel.CRITICAL) {
            rateController.applyCooldown(ctx.getClientKey(), level);
            telemetry.logMitigation("cooldown", ctx.getClientKey(), level.name());
        }

        if (props.isStealth()) {
            sendStealthyUnavailable(response, level == RiskLevel.CRITICAL ? 30 : 10);
        } else {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setHeader("Retry-After", String.valueOf(level == RiskLevel.CRITICAL ? 60 : 30));
            response.getWriter().write("");
        }
        return true;
    }

    /**
     * Apply rate-limit response. Stealthy: same status as overload.
     */
    public boolean applyRateLimit(HttpServletResponse response, int retryAfterSeconds) throws IOException {
        if (props.isStealth()) {
            sendStealthyUnavailable(response, Math.min(retryAfterSeconds, 60));
        } else {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.getWriter().write("");
        }
        return true;
    }

    private void sendStealthyUnavailable(HttpServletResponse response, int retryAfterSeconds) throws IOException {
        response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType("text/plain");
        response.setContentLength(0);
        response.getWriter().write("");
    }
}
