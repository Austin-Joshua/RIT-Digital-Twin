package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.SustainabilityMetric;
import com.rit.digitaltwin.repository.SustainabilityMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

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
}
