package com.university.erp.intelligence;

import java.math.BigDecimal;

/**
 * One energy rule for campus state, the map, forecasting, and simulation.
 * A missing stored base load is unavailable. It is never replaced with 0.
 */
public final class EnergyFormula {

    public static final double CLASS_KW = 5.5;
    public static final String BECAUSE =
            "Stored base load plus 5.5 kW per scheduled class. Not a meter.";
    public static final String UNAVAILABLE =
            "No base load is stored for this building, so formula load is not shown.";

    private EnergyFormula() {
    }

    public static Double kw(BigDecimal baseLoad, double classes) {
        if (baseLoad == null) {
            return null;
        }
        double classTerm = Math.max(0, classes) * CLASS_KW;
        return round(baseLoad.doubleValue() + classTerm);
    }

    public static Double kw(BigDecimal baseLoad, int classes) {
        return kw(baseLoad, (double) classes);
    }

    /**
     * Simulation may scale only the class term. Buildings without a stored base load
     * do not contribute, and a class term alone is not a result.
     */
    public static Double simulated(Iterable<BigDecimal> baseLoads, double classLoad, double classFactor) {
        double sum = 0;
        boolean any = false;
        if (baseLoads != null) {
            for (BigDecimal base : baseLoads) {
                Double kw = kw(base, 0);
                if (kw != null) {
                    sum += kw;
                    any = true;
                }
            }
        }
        if (!any) {
            return null;
        }
        double factor = classFactor <= 0 ? 1 : classFactor;
        return round(sum + Math.max(0, classLoad) * CLASS_KW * factor);
    }

    public static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
