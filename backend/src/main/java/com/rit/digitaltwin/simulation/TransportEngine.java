package com.rit.digitaltwin.simulation;

import com.rit.digitaltwin.dto.TransportSimulationResponse.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Engine for Transport Simulation Logic.
 */
@Component
public class TransportEngine {

    public double calculateRouteEfficiency(double occupancy, double distance, int stops) {
        double occScore = occupancy >= 85 ? 100 : occupancy >= 70 ? 85 : occupancy >= 50 ? 65 : 40;
        double stopsPerKm = (double) stops / distance;
        double stopsScore = stopsPerKm <= 0.3 ? 90 : stopsPerKm <= 0.5 ? 75 : 60;
        double distScore = distance <= 20 ? 90 : distance <= 30 ? 75 : 55;
        return (occScore * 0.50) + (stopsScore * 0.25) + (distScore * 0.25);
    }

    public double getFuelPerKm(String vehicleType) {
        return switch (vehicleType) {
            case "BUS" -> 4.5;
            case "MINI_BUS" -> 3.0;
            case "VAN" -> 2.0;
            case "SHUTTLE" -> 2.5;
            case "ELECTRIC_BUS" -> 0.0;
            default -> 4.0;
        };
    }

    // Need to define RouteTemplate locally or share it.
    // Since it was a private record in Service, I will redefine a DTO or use
    // generic structure here
    // to avoid circular dependencies if I import Service.
    // Better to have shared model or DTO. For now, I'll assume caller passes data
    // needed.

    public RouteDetail buildRouteDetail(String code, String name, String origin, double distKm, int durationMin,
            int stops, int students, int capacity, String vehicleType) {
        double fuelPerKm = getFuelPerKm(vehicleType);
        double routeFuel = distKm * 2 * fuelPerKm;
        double occupancy = (double) students / capacity * 100;
        double efficiency = calculateRouteEfficiency(occupancy, distKm, stops);

        return RouteDetail.builder()
                .routeCode(code)
                .routeName(name)
                .origin(origin)
                .destination("RIT Campus, Thandalam")
                .distanceKm(round(distKm))
                .durationMin(durationMin)
                .stops(stops)
                .students(students)
                .vehicleCapacity(capacity)
                .occupancyPercent(round(occupancy))
                .fuelLitres(round(routeFuel))
                .efficiencyScore(round(efficiency))
                .vehicleType(vehicleType)
                .status(occupancy >= 80 ? "OPTIMAL" : occupancy >= 50 ? "MODERATE" : "UNDER_UTILIZED")
                .build();
    }

    public OptimizationResult optimize(double currentEfficiency, double optimPct, double totalFuel, int routeCount,
            int totalStops, double fuelCost, double co2PerLitre, boolean includeEv) {
        double optimizedEfficiency = Math.min(100, currentEfficiency * (1 + optimPct));
        double fuelSaved = totalFuel * optimPct;
        int routesMerged = (int) (routeCount * 0.15);
        int stopsOptimized = (int) (totalStops * 0.20);

        List<String> recommendations = new ArrayList<>();
        recommendations.add(String.format("Merge %d under-utilized routes to reduce fleet by %d vehicles", routesMerged,
                routesMerged));
        recommendations.add(
                String.format("Optimize %d stops by repositioning to reduce route distance by 12%%", stopsOptimized));
        recommendations.add("Implement GPS-based dynamic routing for real-time traffic avoidance");
        recommendations.add("Shift long-distance routes (>25 km) to CNG to reduce fuel cost by 30%");
        if (includeEv)
            recommendations.add("Replace 4 diesel buses with electric to cut emissions by 35%");

        return OptimizationResult.builder()
                .optimizationScore(round(optimizedEfficiency))
                .currentEfficiency(round(currentEfficiency))
                .optimizedEfficiency(round(optimizedEfficiency))
                .fuelReductionPercent(round(optimPct * 100))
                .fuelSavingsLitres(round(fuelSaved * 26))
                .costSavingsInr(round(fuelSaved * 26 * fuelCost))
                .co2ReductionKg(round(fuelSaved * 26 * co2PerLitre))
                .routesMerged(routesMerged)
                .stopsOptimized(stopsOptimized)
                .recommendations(recommendations)
                .build();
    }

    public EvScenario calculateEvScenario(int evCount, int routeCount, double totalFuel, double totalDistance,
            double fuelCost) {
        double evCostPerBus = 12000000;
        double dieselAnnualCost = totalFuel * 300 * fuelCost;
        double evElectricityCost = totalDistance * 0.8 * 8 * 300;
        double evFraction = (double) evCount / routeCount;
        double annualFuelSaved = dieselAnnualCost * evFraction;
        double evPurchase = evCount * evCostPerBus;
        double payback = evPurchase / (annualFuelSaved - evElectricityCost * evFraction);
        double netSavings = (annualFuelSaved - evElectricityCost * evFraction) * 10 - evPurchase;

        return EvScenario.builder()
                .evReplacements(evCount)
                .annualFuelSavingsInr(round(annualFuelSaved))
                .evPurchaseCostInr(round(evPurchase))
                .paybackYears(round(Math.max(0, payback)))
                .co2ReductionPercent(round(evFraction * 100))
                .electricityCostInr(round(evElectricityCost * evFraction))
                .netSavingsInr(round(netSavings))
                .build();
    }

    public double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
