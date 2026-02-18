package com.rit.digitaltwin.simulation;

import com.rit.digitaltwin.dto.PredictiveForecastResponse.ForecastPoint;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Engine for Predictive Analytics logic.
 * Handles historical data generation, forecasting (linear regression), and
 * insight generation.
 */
@Component
public class PredictiveEngine {

    private static final Random RANDOM = new Random();

    // Simulated historical data generation (placeholder for real DB data)
    public List<Double> generateHistory(String metric) {
        List<Double> history = new ArrayList<>();
        double baseValue = getBaseValueForMetric(metric);
        double volatility = getVolatilityForMetric(metric);

        // Generate 12 months history
        for (int i = 0; i < 12; i++) {
            double change = (RANDOM.nextDouble() - 0.5) * volatility;
            double value = baseValue * (1 + change);
            history.add(round(value));
            // Trend
            baseValue *= (1 + (RANDOM.nextDouble() * 0.02)); // Slight upward trend
        }
        return history;
    }

    public List<ForecastPoint> generateForecast(List<Double> history, int months) {
        List<ForecastPoint> forecast = new ArrayList<>();

        // Simple linear regression
        double[] x = new double[history.size()];
        double[] y = new double[history.size()];
        for (int i = 0; i < history.size(); i++) {
            x[i] = i + 1;
            y[i] = history.get(i);
        }

        double[] coeffs = linearRegression(x, y);
        double slope = coeffs[1];
        double intercept = coeffs[0];

        // Generate next 'months' points
        for (int i = 1; i <= months; i++) {
            int futureX = history.size() + i;
            double predictedVal = intercept + slope * futureX;

            // Add some uncertainty range
            double lowerBound = predictedVal * 0.95;
            double upperBound = predictedVal * 1.05;

            forecast.add(ForecastPoint.builder()
                    .monthIndex(i)
                    .value(round(predictedVal))
                    .lowerBound(round(lowerBound))
                    .upperBound(round(upperBound))
                    .build());
        }
        return forecast;
    }

    public List<String> generateInsights(String metric, String trend, double growthRate) {
        List<String> insights = new ArrayList<>();

        insights.add(String.format("%s is showing a %s trend of %.1f%%.", metric, trend, growthRate));

        if (growthRate > 5) {
            insights.add("High growth detected. Consider scaling resources.");
            if (metric.contains("Energy"))
                insights.add("Investigate efficiency measures to curb rising consumption.");
            if (metric.contains("Enrollment"))
                insights.add("Plan for additional classroom capacity.");
        } else if (growthRate < -5) {
            insights.add("Significant decline detected.");
            if (metric.contains("Attendance"))
                insights.add("Review engagement strategies.");
        } else {
            insights.add("Metric is stable. Maintain current operations.");
        }

        return insights;
    }

    private double getBaseValueForMetric(String metric) {
        if (metric.equalsIgnoreCase("Energy Consumption"))
            return 15000.0;
        if (metric.equalsIgnoreCase("Water Usage"))
            return 45000.0;
        if (metric.equalsIgnoreCase("Classroom Utilization"))
            return 75.0;
        if (metric.equalsIgnoreCase("Student Enrollment"))
            return 4200.0;
        if (metric.equalsIgnoreCase("Bus Occupancy"))
            return 85.0;
        return 100.0;
    }

    private double getVolatilityForMetric(String metric) {
        if (metric.equalsIgnoreCase("Energy Consumption"))
            return 0.15; // Seasonal
        if (metric.equalsIgnoreCase("Water Usage"))
            return 0.10;
        if (metric.equalsIgnoreCase("Classroom Utilization"))
            return 0.20; // Varies by schedule
        return 0.05;
    }

    // [intercept, slope]
    private double[] linearRegression(double[] x, double[] y) {
        int n = x.length;
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        for (int i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
        }

        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;

        return new double[] { intercept, slope };
    }

    private double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
