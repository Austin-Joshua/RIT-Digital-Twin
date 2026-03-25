package com.university.erp.security.defense;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.adaptive-defense")
public class AdaptiveDefenseProperties {

    private boolean enabled = true;
    private int baselineWindowMinutes = 60;
    private int baselineMinSamples = 20;

    private Risk risk = new Risk();
    private RateLimit rateLimit = new RateLimit();
    private Session session = new Session();
    private DataAccess dataAccess = new DataAccess();
    private Cooldown cooldown = new Cooldown();
    private boolean stealth = true;

    @Data
    public static class Risk {
        private int lowThreshold = 25;
        private int mediumThreshold = 50;
        private int highThreshold = 75;
        private int criticalThreshold = 90;
        private int decayPerMinute = 2;
    }

    @Data
    public static class RateLimit {
        private int normalRequestsPerMinute = 300;
        private int elevatedRequestsPerMinute = 120;
        private int highRequestsPerMinute = 60;
        private int criticalRequestsPerMinute = 20;
        private int windowSeconds = 60;
    }

    @Data
    public static class Session {
        private int maxRequestsPerMinutePerSession = 120;
        private long rapidActionWindowMs = 2000;
        private int rapidActionThreshold = 15;
        private boolean revalidateAfterAnomaly = true;
    }

    @Data
    public static class DataAccess {
        private int listRequestBurstThreshold = 30;
        private int listBurstWindowSeconds = 60;
    }

    @Data
    public static class Cooldown {
        private int highRiskMinutes = 5;
        private int criticalMinutes = 15;
    }
}
