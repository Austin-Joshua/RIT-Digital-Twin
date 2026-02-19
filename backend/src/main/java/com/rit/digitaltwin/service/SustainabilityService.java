package com.rit.digitaltwin.service;

import com.rit.digitaltwin.dto.SustainabilityDashboardResponse;
import com.rit.digitaltwin.model.SustainabilityMetric;
import com.rit.digitaltwin.repository.SustainabilityMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class SustainabilityService {

        private final SustainabilityMetricRepository repository;

        public List<SustainabilityMetric> getDashboardMetrics() {
                return repository.findAll();
        }

        public Double calculateCompositeScore() {
                // Logic to average out metrics
                return 85.5; // Dummy score
        }

        public SustainabilityDashboardResponse getDashboard() {
                return SustainabilityDashboardResponse.builder()
                                .compositeIndex(calculateCompositeScore())
                                .compositeGrade("A")
                                .lastUpdated(java.time.LocalDate.now().toString())
                                .summary("Campus sustainability metrics are performing well.")
                                .energy(SustainabilityDashboardResponse.EnergyScore.builder()
                                                .score(88.0)
                                                .grade("A")
                                                .totalConsumptionKwh(150000.0)
                                                .renewablePercent(25.0)
                                                .efficiencyGain(5.0)
                                                .peakDemandKw(500.0)
                                                .solarGenerationKwh(30000.0)
                                                .costPerSqft(1.2)
                                                .build())
                                .transport(SustainabilityDashboardResponse.TransportScore.builder()
                                                .score(82.0)
                                                .grade("B+")
                                                .fleetEfficiency(12.5)
                                                .avgOccupancyPercent(75.0)
                                                .fuelPerStudentLitres(10.0)
                                                .co2PerStudentKg(5.0)
                                                .evAdoptionPercent(15.0)
                                                .routesOptimized(8)
                                                .build())
                                .infrastructure(SustainabilityDashboardResponse.InfrastructureScore.builder()
                                                .score(90.0)
                                                .grade("A+")
                                                .classroomUtilizationPercent(85.0)
                                                .labUtilizationPercent(70.0)
                                                .facilityOccupancyPercent(80.0)
                                                .spaceEfficiencyIndex(0.9)
                                                .maintenanceResponseHrs(4.0)
                                                .digitalizedRooms(45)
                                                .build())
                                .carbon(SustainabilityDashboardResponse.CarbonFootprint.builder()
                                                .totalCo2TonsYear(1200.0)
                                                .perCapitaCo2Kg(0.5)
                                                .reductionFromBaseline(10.0)
                                                .scope1Tons(400.0)
                                                .scope2Tons(500.0)
                                                .scope3Tons(300.0)
                                                .offsetTons(50.0)
                                                .netEmissions(1150.0)
                                                .neutralityTarget("2030")
                                                .build())
                                .monthlyTrend(Collections.emptyList())
                                .sdgGoals(Collections.emptyList())
                                .activeInitiatives(Collections.emptyList())
                                .build();
        }
}
