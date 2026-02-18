package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SimulationHistoryService {

    private final SimulationResultRepository repository;

    public List<SimulationResult> getHistory() {
        return repository.findAll();
    }

    public SimulationResult saveResult(SimulationResult result) {
        return repository.save(result);
    }
}
