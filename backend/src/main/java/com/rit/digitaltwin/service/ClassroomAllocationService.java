package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Classroom;
import com.rit.digitaltwin.repository.ClassroomRepository;
import com.rit.digitaltwin.dto.ClassroomSimulationRequest;
import com.rit.digitaltwin.dto.ClassroomSimulationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomAllocationService {

    private final ClassroomRepository classroomRepository;

    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    public Map<String, Object> runAllocationSimulation(int studentCount) {
        // Simplified Logic: Find classrooms with capacity >= studentCount
        List<Classroom> suitableClassrooms = classroomRepository.findAll().stream()
                .filter(c -> c.getCapacity() >= studentCount)
                .collect(Collectors.toList());

        return Map.of(
                "status", "SUCCESS",
                "studentCount", studentCount,
                "suitableClassrooms", suitableClassrooms.size(),
                "allocatedClassrooms", suitableClassrooms);
    }

    public ClassroomSimulationResponse runSimulation(ClassroomSimulationRequest request) {
        // Mock implementation
        return ClassroomSimulationResponse.builder()
                .simulationId(1L)
                .status("COMPLETED")
                .executionTimeMs(150L)
                .totalRoomsEvaluated(10)
                .totalRecommendations(2)
                .summary("Allocated successfully")
                .inputParameters(request)
                .recommendations(Collections.emptyList())
                .build();
    }

    public ClassroomSimulationResponse getSimulationById(Long id) {
        // Mock implementation
        return ClassroomSimulationResponse.builder()
                .simulationId(id)
                .status("COMPLETED")
                .build();
    }

    public List<ClassroomSimulationResponse> getRecentSimulations() {
        return Collections.emptyList();
    }
}
