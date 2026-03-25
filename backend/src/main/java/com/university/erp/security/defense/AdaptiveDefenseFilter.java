package com.university.erp.security.defense;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import com.university.erp.entity.User;

/**
 * Military-grade adaptive defense filter. Runs first to record behavior,
 * check rate limits, run anomaly detection, update risk, and apply
 * countermeasures. Stealthy and non-disruptive to legitimate users.
 */
@Slf4j
@Component
public class AdaptiveDefenseFilter extends OncePerRequestFilter implements Ordered {

    private static final int ORDER = -500;

    private final AdaptiveDefenseProperties props;
    private final BehavioralBaselineService baselineService;
    private final AnomalyDetectionService anomalyService;
    private final RiskScoringService riskScoringService;
    private final AdaptiveRateController rateController;
    private final SessionDefenseService sessionDefenseService;
    private final PrivilegeMisuseDetector privilegeMisuseDetector;
    private final DataAccessAnomalyService dataAccessAnomalyService;
    private final CountermeasureExecutor countermeasureExecutor;
    private final DefenseLevelManager defenseLevelManager;
    private final SecurityTelemetryService telemetry;
    private final ResourcePrioritization resourcePrioritization;

    public AdaptiveDefenseFilter(AdaptiveDefenseProperties props,
                                 BehavioralBaselineService baselineService,
                                 AnomalyDetectionService anomalyService,
                                 RiskScoringService riskScoringService,
                                 AdaptiveRateController rateController,
                                 SessionDefenseService sessionDefenseService,
                                 PrivilegeMisuseDetector privilegeMisuseDetector,
                                 DataAccessAnomalyService dataAccessAnomalyService,
                                 CountermeasureExecutor countermeasureExecutor,
                                 DefenseLevelManager defenseLevelManager,
                                 SecurityTelemetryService telemetry,
                                 ResourcePrioritization resourcePrioritization) {
        this.props = props;
        this.baselineService = baselineService;
        this.anomalyService = anomalyService;
        this.riskScoringService = riskScoringService;
        this.rateController = rateController;
        this.sessionDefenseService = sessionDefenseService;
        this.privilegeMisuseDetector = privilegeMisuseDetector;
        this.dataAccessAnomalyService = dataAccessAnomalyService;
        this.countermeasureExecutor = countermeasureExecutor;
        this.defenseLevelManager = defenseLevelManager;
        this.telemetry = telemetry;
        this.resourcePrioritization = resourcePrioritization;
    }

    @Override
    public int getOrder() {
        return ORDER;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!props.isEnabled()) return true;
        String path = request.getRequestURI();
        if (path == null) return true;
        if ("/actuator/health".equals(path) || path.startsWith("/actuator/")) return true;
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startMs = System.currentTimeMillis();
        ClientContext ctx = buildContext(request);

        if (resourcePrioritization.isCritical(ctx.getPath())) {
            filterChain.doFilter(request, response);
            return;
        }

        RiskLevel riskLevel = riskScoringService.getLevel(ctx.getClientKey());
        AdaptiveRateController.RateLimitResult rateResult = rateController.checkAndIncrement(ctx.getClientKey(), riskLevel);

        if (!rateResult.isAllowed()) {
            defenseLevelManager.recordBlock();
            telemetry.logMitigation("rate_limit", ctx.getClientKey(), "throttle");
            if (countermeasureExecutor.applyRateLimit(response, rateResult.getRetryAfterSeconds())) {
                return;
            }
        }

        baselineService.recordRequest(ctx);

        int currentInWindow = rateResult.getCurrentCount();
        AnomalyDetectionService.AnomalyResult anomalyResult = anomalyService.evaluate(ctx, currentInWindow);

        if (!anomalyResult.getAnomalies().isEmpty()) {
            defenseLevelManager.recordAnomaly();
            riskScoringService.recordAnomaly(ctx.getClientKey(), anomalyResult.getSeverity());
            String anomalyTypes = anomalyResult.getAnomalies().stream()
                    .map(Enum::name)
                    .reduce((a, b) -> a + "," + b)
                    .orElse("unknown");
            telemetry.logAnomaly(SecurityTelemetryService.hashForLog(ctx.getClientKey()), anomalyTypes, anomalyResult.getSeverity());
        }

        if (dataAccessAnomalyService.checkListBurst(ctx)) {
            riskScoringService.recordDataBurst(ctx.getClientKey());
        }

        SessionDefenseService.SessionCheckResult sessionResult = sessionDefenseService.check(ctx);
        if (!sessionResult.isOk()) {
            riskScoringService.recordRapidActions(ctx.getClientKey());
        }

        PrivilegeMisuseDetector.PrivilegeCheckResult privilegeResult = privilegeMisuseDetector.check(ctx);
        if (!privilegeResult.isOk()) {
            riskScoringService.addRisk(ctx.getClientKey(), 10, privilegeResult.getAnomalyType());
        }

        riskLevel = riskScoringService.getLevel(ctx.getClientKey());
        if (riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.CRITICAL) {
            if (countermeasureExecutor.applyCountermeasure(ctx, riskLevel, request, response)) {
                return;
            }
        }

        riskScoringService.recordNormalBehavior(ctx.getClientKey());
        filterChain.doFilter(request, response);
    }

    private ClientContext buildContext(HttpServletRequest request) {
        String ip = getClientIp(request);
        String path = request.getRequestURI();
        String method = request.getMethod();
        long ts = System.currentTimeMillis();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = null;
        String role = null;
        boolean authenticated = false;
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User user) {
            userId = String.valueOf(user.getUserId());
            role = user.getRole() != null ? user.getRole().getRoleName().name() : null;
            authenticated = true;
        }

        String clientKey = authenticated ? (ip + "|" + userId) : ip;
        return ClientContext.builder()
                .clientKey(clientKey)
                .ipAddress(ip)
                .userId(userId)
                .role(role)
                .path(path)
                .method(method)
                .timestampMs(ts)
                .authenticated(authenticated)
                .build();
    }

    private static String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote != null ? remote : "0.0.0.0";
    }
}
