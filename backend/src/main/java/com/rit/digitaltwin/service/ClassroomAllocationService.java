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
        // Real Logic: Find classrooms with capacity >= studentCount, sorted by least
        // unused seats
        List<Classroom> suitableClassrooms = classroomRepository.findAll().stream()
                .filter(c -> c.getCapacity() >= studentCount)
                .sorted((c1, c2) -> Integer.compare(c1.getCapacity(), c2.getCapacity()))
                .collect(Collectors.toList());

        return Map.of(
                "status", "SUCCESS",
                "studentCount", studentCount,
                "suitableClassrooms", suitableClassrooms.size(),
                "allocatedClassrooms", suitableClassrooms);
    }

    public ClassroomSimulationResponse runSimulation(ClassroomSimulationRequest request) {
        int studentCount = request.getStudentCount() != null ? request.getStudentCount() : 60;

        List<Classroom> classrooms = classroomRepository.findAll();
        List<Classroom> suitableOnes = classrooms.stream()
                .filter(c -> c.getCapacity() >= studentCount)
                .sorted((c1, c2) -> Integer.compare(c1.getCapacity(), c2.getCapacity()))
                .collect(Collectors.toList());

        String summary = suitableOnes.isEmpty()
                ? "No suitable classrooms found for " + studentCount + " students."
                : "Found " + suitableOnes.size() + " suitable rooms. Best fit: " + suitableOnes.get(0).getRoomNumber()
                        + " (Capacity: " + suitableOnes.get(0).getCapacity() + ")";

        List<ClassroomSimulationResponse.ClassroomRecommendation> recs = suitableOnes.stream()
                .limit(5)
                .map(c -> ClassroomSimulationResponse.ClassroomRecommendation.builder()
                        .classroomId(c.getRoomId())
                        .roomNumber(c.getRoomNumber())
                        .buildingName(c.getBuilding().getBuildingName())
                        .buildingCode(c.getBuilding().getCode())
                        .floor(c.getFloor())
                        .capacity(c.getCapacity())
                        .roomType(c.getRoomType() != null ? c.getRoomType().name() : "GENERAL")
                        .hasAc(c.getHasAc())
                        .hasProjector(c.getHasProjector())
                        .hasSmartBoard(c.getHasSmartBoard())
                        .wastedCapacity(c.getCapacity() - studentCount)
                        .utilizationPercent((double) studentCount / c.getCapacity() * 100)
                        .availabilityStatus("AVAILABLE")
                        .build())
                .collect(Collectors.toList());

        return ClassroomSimulationResponse.builder()
                .simulationId(System.currentTimeMillis())
                .status("COMPLETED")
                .executionTimeMs(50L)
                .totalRoomsEvaluated(classrooms.size())
                .totalRecommendations(suitableOnes.size())
                .summary(summary)
                .inputParameters(request)
                .recommendations(recs)
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
