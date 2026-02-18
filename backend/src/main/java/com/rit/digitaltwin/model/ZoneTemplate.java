package com.rit.digitaltwin.model;

public record ZoneTemplate(String id, String name, String building, int floor,
        int capacity, double areaSqm, int exits) {
}
