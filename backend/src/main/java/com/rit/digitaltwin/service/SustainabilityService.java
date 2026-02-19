package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.SustainabilityMetric;
import com.rit.digitaltwin.repository.SustainabilityMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SustainabilityService {

    @Autowired
    private SustainabilityMetricRepository repository;

    public List<SustainabilityMetric> getHistory() {
        return repository.findAll();
    }

    public SustainabilityMetric calculateCurrentMetrics() {
        // In a real system, this would aggregate data from Energy, Transport, and Waste modules
        SustainabilityMetric metric = new SustainabilityMetric();
        metric.setDate(LocalDate.now());
        metric.setEnergyScore(85.5);
        metric.setTransportScore(92.1);
        metric.setWasteManagementScore(78.4);
        
        // Simple average as composite index
        double composite = (metric.getEnergyScore() + metric.getTransportScore() + metric.getWasteManagementScore()) / 3.0;
        metric.setCompositeIndex(Math.round(composite * 100.0) / 100.0);
        
        return repository.save(metric);
    }
}
