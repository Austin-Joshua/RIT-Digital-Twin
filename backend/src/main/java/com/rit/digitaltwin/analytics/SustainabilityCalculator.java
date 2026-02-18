package com.rit.digitaltwin.analytics;

import com.rit.digitaltwin.dto.SustainabilityDashboardResponse.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculator for Sustainability Scores and Metrics.
 */
@Component
public class SustainabilityCalculator {

    public EnergyScore computeEnergyScore(double totalKwh, double renewablePct, double efficiencyGain,
            double peakDemand, double solarGen, double costPerSqft) {
        double score = Math.min(100, renewablePct * 1.5 + efficiencyGain * 2.0 + (15 - costPerSqft) * 3.0);
        score = Math.max(30, score);

        return EnergyScore.builder()
                .score(round(score))
                .grade(toGrade(score))
                .totalConsumptionKwh(totalKwh)
                .renewablePercent(renewablePct)
                .efficiencyGain(efficiencyGain)
                .peakDemandKw(peakDemand)
                .solarGenerationKwh(solarGen)
                .costPerSqft(costPerSqft)
                .build();
    }

    public TransportScore computeTransportScore(double fleetEfficiency, double avgOccupancy, double fuelPerStudent,
            double co2PerStudent, double evAdoption, int routesOptimized) {
        double score = Math.min(100, avgOccupancy * 0.40 + fleetEfficiency * 0.30 + evAdoption * 1.0
                + Math.max(0, (3.0 - fuelPerStudent) * 10));
        score = Math.max(30, score);

        return TransportScore.builder()
                .score(round(score))
                .grade(toGrade(score))
                .fleetEfficiency(fleetEfficiency)
                .avgOccupancyPercent(avgOccupancy)
                .fuelPerStudentLitres(fuelPerStudent)
                .co2PerStudentKg(co2PerStudent)
                .evAdoptionPercent(evAdoption)
                .routesOptimized(routesOptimized)
                .build();
    }

    public InfrastructureScore computeInfrastructureScore(double classroomUtil, double labUtil, double facilityOcc,
            double spaceEfficiency, double maintenanceResp, int digitalizedRooms) {
        double score = Math.min(100, classroomUtil * 0.25 + labUtil * 0.25 + spaceEfficiency * 25
                + Math.max(0, (8 - maintenanceResp) * 5) + digitalizedRooms * 0.15);
        score = Math.max(30, score);

        return InfrastructureScore.builder()
                .score(round(score))
                .grade(toGrade(score))
                .classroomUtilizationPercent(classroomUtil)
                .labUtilizationPercent(labUtil)
                .facilityOccupancyPercent(facilityOcc)
                .spaceEfficiencyIndex(spaceEfficiency)
                .maintenanceResponseHrs(maintenanceResp)
                .digitalizedRooms(digitalizedRooms)
                .build();
    }

    public CarbonFootprint computeCarbonFootprint(double scope1, double scope2, double scope3, double offsets,
            double baselineTotal) {
        double total = scope1 + scope2 + scope3;
        double net = total - offsets;
        double perCapita = net / 5200 * 1000;
        double reduction = round((baselineTotal - total) / baselineTotal * 100);

        return CarbonFootprint.builder()
                .totalCo2TonsYear(total)
                .perCapitaCo2Kg(round(perCapita))
                .reductionFromBaseline(reduction)
                .scope1Tons(scope1)
                .scope2Tons(scope2)
                .scope3Tons(scope3)
                .offsetTons(offsets)
                .netEmissions(net)
                .neutralityTarget("2040")
                .build();
    }

    public double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    public String toGrade(double score) {
        if (score >= 90)
            return "A+";
        if (score >= 80)
            return "A";
        if (score >= 70)
            return "B+";
        if (score >= 60)
            return "B";
        if (score >= 50)
            return "C+";
        if (score >= 40)
            return "C";
        return "D";
    }
}
