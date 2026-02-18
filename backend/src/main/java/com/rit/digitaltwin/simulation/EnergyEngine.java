package com.rit.digitaltwin.simulation;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;

/**
 * Engine for Energy calculations (Profile generation, solar estimation).
 */
@Component
public class EnergyEngine {

    private static final double[] HOURLY_CAMPUS_PROFILE = {
            15.0, 12.0, 10.0, 10.0, 11.0, 14.0, 25.0, 45.0, 72.0, 85.0, 90.0, 88.0,
            70.0, 65.0, 78.0, 82.0, 68.0, 45.0, 35.0, 30.0, 25.0, 22.0, 18.0, 16.0
    };

    private static final double[] SOLAR_GENERATION_PROFILE = {
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.05, 0.20, 0.50, 0.75, 0.90, 0.95,
            1.00, 0.95, 0.85, 0.70, 0.45, 0.15, 0.02, 0.0, 0.0, 0.0, 0.0, 0.0
    };

    public double calculateTotalDailyKwh() {
        return Arrays.stream(HOURLY_CAMPUS_PROFILE).sum();
    }

    public double getPeakDemand() {
        return Arrays.stream(HOURLY_CAMPUS_PROFILE).max().orElse(0) * 10;
    }

    public double calculateDailySolarGeneration(double capacityKw) {
        double dailySolar = 0;
        for (double factor : SOLAR_GENERATION_PROFILE) {
            dailySolar += factor * capacityKw;
        }
        return dailySolar;
    }

    public double getHourlyConsumption(int hour) {
        if (hour < 0 || hour >= 24)
            return 0;
        return HOURLY_CAMPUS_PROFILE[hour];
    }

    public double getHourlySolarFactor(int hour) {
        if (hour < 0 || hour >= 24)
            return 0;
        return SOLAR_GENERATION_PROFILE[hour];
    }

    public double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
