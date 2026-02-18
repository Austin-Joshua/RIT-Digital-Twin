package com.rit.digitaltwin.analytics;

/**
 * Base package for analytics engines.
 * 
 * Future modules:
 * - Predictive Analytics Engine
 * - Sustainability Analytics
 * - Energy Efficiency Analytics
 * - Campus Utilization Analytics
 */
public abstract class AnalyticsEngine {

    public abstract String getModuleName();

    public abstract void loadData();

    public abstract Object analyze(Object parameters);

    public abstract Object generateReport();
}
