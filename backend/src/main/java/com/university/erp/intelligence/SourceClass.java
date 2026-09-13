package com.university.erp.intelligence;

/**
 * How a campus figure was produced. Every intelligence payload should carry one of these
 * so the product never presents a model, a baseline, or a simulator as a live sensor.
 */
public enum SourceClass {
    LIVE,
    SIMULATED,
    HISTORICAL,
    PREDICTED,
    ESTIMATED
}
