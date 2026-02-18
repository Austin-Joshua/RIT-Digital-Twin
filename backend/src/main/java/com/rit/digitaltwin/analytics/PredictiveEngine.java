package com.rit.digitaltwin.analytics;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Predictive Engine utilizing Linear Regression.
 */
@Component
public class PredictiveEngine {

    public double[] linearRegression(double[] x, double[] y) {
        int n = x.length;
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
        }
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;
        return new double[] { intercept, slope };
    }

    public double calculateRSquared(double[] x, double[] y, double[] coeffs) {
        double mean = 0;
        for (double v : y)
            mean += v;
        mean /= y.length;

        double ssTot = 0, ssRes = 0;
        for (int i = 0; i < y.length; i++) {
            double predicted = coeffs[0] + coeffs[1] * x[i];
            ssTot += (y[i] - mean) * (y[i] - mean);
            ssRes += (y[i] - predicted) * (y[i] - predicted);
        }
        return ssTot == 0 ? 1.0 : 1.0 - (ssRes / ssTot);
    }

    public double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    public double[] toDouble(int[] arr) {
        double[] result = new double[arr.length];
        for (int i = 0; i < arr.length; i++)
            result[i] = arr[i];
        return result;
    }
}
