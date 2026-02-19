package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Classroom;
import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.repository.ClassroomRepository;
import com.rit.digitaltwin.repository.SimulationResultRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClassroomService {

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private SimulationResultRepository simulationResultRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    public List<Classroom> recommendClassrooms(int studentStrength, boolean needsProjector) {
        // Simple allocation logic: find rooms with capacity >= strength, sorted by
        // capacity ASC (to minimize unused seats)
        return classroomRepository.findAll().stream()
                .filter(room -> room.getCapacity() >= studentStrength)
                .filter(room -> !needsProjector || Boolean.TRUE.equals(room.getHasProjector())) // If projector needed,
                                                                                                // must have it. If not,
                // don't care.
                .sorted(Comparator.comparingInt(Classroom::getCapacity))
                .limit(5)
                .collect(Collectors.toList());
    }

    public SimulationResult runAllocationSimulation(Map<String, Object> params) {
        int strength = (int) params.get("studentStrength");
        boolean needsProjector = Boolean.TRUE.equals(params.get("needsProjector"));

        List<Classroom> recommended = recommendClassrooms(strength, needsProjector);

        SimulationResult result = new SimulationResult();
        result.setSimType(com.rit.digitaltwin.model.SimulationType.CLASSROOM_ALLOCATION);
        try {
            result.setParametersJson(objectMapper.writeValueAsString(params));
            result.setResultJson(objectMapper.writeValueAsString(recommended));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing JSON", e);
        }

        return simulationResultRepository.save(result);
    }
}
