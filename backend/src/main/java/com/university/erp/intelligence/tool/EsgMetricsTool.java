package com.university.erp.intelligence.tool;

import com.university.erp.intelligence.EnergyFormula;
import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.Building;
import com.university.erp.model.TransportRoute;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class EsgMetricsTool implements CampusTool {

    private static final double DIESEL_CO2_FACTOR = 2.68; // kg CO2 per litre of diesel
    private static final double GRID_EMISSION_FACTOR = 0.82; // kg CO2 per kWh grid electricity (India CEA baseline)

    private final BuildingRepository buildingRepository;
    private final TransportRouteRepository transportRouteRepository;

    @Override
    public String name() {
        return "get_esg_metrics";
    }

    @Override
    public String description() {
        return "Evaluates campus ESG and sustainability performance including transport fleet emissions, building energy carbon footprint, and solar renewable offsets.";
    }

    @Override
    public List<String> requiredRoles() {
        return List.of("ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT");
    }

    @Override
    public ToolResult execute(Map<String, Object> params, String userRole) {
        List<Building> buildings = buildingRepository.findAll();
        List<TransportRoute> routes = transportRouteRepository.findAll();

        double totalBaseKw = buildings.stream()
                .filter(b -> b.getBaseEnergyLoad() != null)
                .mapToDouble(b -> b.getBaseEnergyLoad().doubleValue())
                .sum();

        // Transport fleet calculations
        int routeCount = Math.max(1, routes.size());
        double estimatedDailyFuel = routeCount * 28.5; // ~28.5L avg per route loop
        double transportCo2DailyKg = EnergyFormula.round(estimatedDailyFuel * DIESEL_CO2_FACTOR);

        // Building power emissions (modeled across an 8-hour operational day)
        double dailyElectricityKwh = totalBaseKw * 8.0;
        double buildingCo2DailyKg = EnergyFormula.round(dailyElectricityKwh * GRID_EMISSION_FACTOR);

        // Solar offset (modeled rooftop solar capacity: 120 kW producing ~480 kWh/day)
        double estimatedSolarKwh = 480.0;
        double solarOffsetCo2Kg = EnergyFormula.round(estimatedSolarKwh * GRID_EMISSION_FACTOR);
        double netDailyCo2Kg = EnergyFormula.round(Math.max(0, (buildingCo2DailyKg - solarOffsetCo2Kg) + transportCo2DailyKg));

        // ESG Sustainability Rating (out of 100)
        double esgScore = EnergyFormula.round(Math.min(95.0, Math.max(50.0, 72.0 + (solarOffsetCo2Kg / 100.0))));

        List<List<Object>> tableRows = List.of(
                List.of("Scope 1: Transport Fleet Diesel", estimatedDailyFuel + " L/day", transportCo2DailyKg + " kg CO2/day", "SIMULATED", "Active routes fuel burn model"),
                List.of("Scope 2: Campus Electricity (Base)", totalBaseKw + " kW base", buildingCo2DailyKg + " kg CO2/day", "ESTIMATED", "Grid carbon factor: 0.82 kg/kWh"),
                List.of("Renewable Solar Generation", estimatedSolarKwh + " kWh/day", "-" + solarOffsetCo2Kg + " kg CO2/day", "ESTIMATED", "Campus solar array yield"),
                List.of("Scope 3: Waste & Water Consumption", "UNAVAILABLE", "UNAVAILABLE", "UNAVAILABLE", "No municipal or utility meters connected")
        );

        String answer = String.format(
                "Campus ESG Sustainability Rating: Score is %.1f/100 (Tier B+ Green Campus). Net daily carbon footprint is estimated at %.1f kg CO2 (Transport Fleet: %.1f kg CO2/day across %d routes; Building Base Power: %.1f kg CO2/day; Solar Offset: -%.1f kg CO2/day). Water and solid waste ledgers are currently marked UNAVAILABLE as no utility meters are connected. (Note: Carbon figures are derived via standard CEA emission factors and formula loads; they are ESTIMATED/SIMULATED).",
                esgScore, netDailyCo2Kg, transportCo2DailyKg, routes.size(), buildingCo2DailyKg, solarOffsetCo2Kg
        );

        return ToolResult.builder(name())
                .answer(answer)
                .sourceClass(SourceClass.ESTIMATED)
                .because("Computed from fleet fuel models, CEA grid carbon factors (0.82 kg/kWh), and building base energy loads.")
                .addCard("ESG Green Score", esgScore + " / 100", "Tier B+", "ESTIMATED", "award")
                .addCard("Net Daily CO2", netDailyCo2Kg, "kg / day", "SIMULATED", "cloud")
                .addCard("Transport Emissions", transportCo2DailyKg, "kg CO2", "SIMULATED", "truck")
                .addCard("Solar Offset", "-" + solarOffsetCo2Kg, "kg CO2", "ESTIMATED", "sun")
                .table(List.of("Emission Category", "Daily Consumption / Capacity", "Carbon Equivalent", "Provenance", "Methodology"), tableRows)
                .addAction("VIEW", "Sustainability Dashboard", "/simulations/sustainability")
                .addAction("VIEW", "Transport Decarbonization", "/simulations/transport")
                .addCitation("RIT ESG Sustainability Framework, §5.0", "§5.0", "Scope 1 diesel (2.68 kg/L) and Scope 2 grid (0.82 kg/kWh).")
                .build();
    }
}
