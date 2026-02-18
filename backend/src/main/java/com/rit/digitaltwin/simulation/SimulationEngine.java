package com.rit.digitaltwin.simulation;

/**
 * Base package for simulation engines.
 * 
 * Future modules:
 * - Energy Consumption Simulation
 * - Crowd Flow & Emergency Simulation
 * - Transport Route Simulation
 * - Classroom Allocation Simulation
 */
public abstract class SimulationEngine {

    public abstract String getModuleName();

    public abstract void initialize();

    public abstract Object runSimulation(Object parameters);

    public abstract Object getResults();
}
