package com.rit.digitaltwin.service;

import org.springframework.stereotype.Service;

import com.rit.digitaltwin.dto.PredictiveForecastResponse;
import java.util.ArrayList;

import java.util.List;

import java.util.Random;

@Service
public class PredictionService {

    public PredictiveForecastResponse generateForecast(String metric, int months) {
        PredictiveForecastResponse response = new PredictiveForecastResponse();
        response.setMetric(metric);
        response.setForecastHorizonMonths(months);

        // Mock Linear Regression Results for Next Semester Demand
        List<PredictiveForecastResponse.ForecastPoint> forecastPoints = new ArrayList<>();
        String[] monthNames = { "Jan", "Feb", "Mar", "Apr", "May", "Jun" };
        Random rand = new Random();

        int baseDemand = 80;
        for (int i = 0; i < monthNames.length; i++) {
            forecastPoints.add(PredictiveForecastResponse.ForecastPoint.builder()
                    .monthIndex(i + 1)
                    .value((double) (baseDemand + rand.nextInt(15)))
                    .lowerBound((double) baseDemand)
                    .upperBound((double) (baseDemand + 20))
                    .build());
            baseDemand += 2; // Slight upward trend
        }

        response.setForecastData(forecastPoints);
        response.setPredictedGrowthRate(5.4);
        response.setRecommendations(List.of(
                "Increase classroom capacity in Block A by 10%",
                "Schedule maintenance for Bus Route 4 due to predicted high load"));

        return response;
    }
}
