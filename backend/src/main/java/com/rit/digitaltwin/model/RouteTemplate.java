package com.rit.digitaltwin.model;

public record RouteTemplate(String code, String name, String origin, double distKm,
        int durationMin, int stops, int students, int capacity, String vehicleType) {
}
