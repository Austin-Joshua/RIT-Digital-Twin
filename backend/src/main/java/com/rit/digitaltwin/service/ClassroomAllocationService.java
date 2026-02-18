package com.rit.digitaltwin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rit.digitaltwin.dto.ClassroomSimulationRequest;
import com.rit.digitaltwin.dto.ClassroomSimulationResponse;
import com.rit.digitaltwin.dto.ClassroomSimulationResponse.ClassroomRecommendation;
import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rit.digitaltwin.model.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassroomAllocationService {

    private final ClassroomRepository classroomRepository;
    // private final TimetableRepository timetableRepository; // Unused
    private final SimulationResultRepository simulationResultRepository;
    private final ObjectMapper objectMapper;
    private final com.rit.digitaltwin.simulation.AllocationEngine allocationEngine;

    // Scoring logic moved to AllocationEngine

    @Transactional
    public ClassroomSimulationResponse runSimulation(ClassroomSimulationRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Starting classroom allocation simulation for {} students", request.getStudentCount());

        // 1. Find candidate classrooms (capacity >= student count)
        RoomType roomType = parseRoomType(request.getRoomType());
        List<Classroom> candidates;

        if (roomType != null) {
            candidates = classroomRepository.findAvailableByMinCapacityAndType(
                    request.getStudentCount(), roomType);
        } else {
            candidates = classroomRepository.findAvailableByMinCapacity(request.getStudentCount());
        }

        log.info("Found {} candidate classrooms with capacity >= {}", candidates.size(), request.getStudentCount());

        // 2. Parse time constraints
        DayOfWeek day = parseDayOfWeek(request.getDayOfWeek());
        LocalTime startSlot = parseTime(request.getStartTime());
        LocalTime endSlot = parseTime(request.getEndTime());

        // 3. Score and rank each classroom
        List<ClassroomRecommendation> recommendations = candidates.stream()
                .map(classroom -> allocationEngine.evaluateClassroom(classroom, request, day, startSlot, endSlot))
                .sorted(Comparator.comparingDouble(ClassroomRecommendation::getSuitabilityScore).reversed())
                .limit(10)
                .collect(Collectors.toList());

        long executionTime = System.currentTimeMillis() - startTime;

        // 4. Build summary
        String summary = buildSummary(request, recommendations, candidates.size());

        // 5. Save simulation result
        SimulationResult simResult = saveSimulationResult(request, recommendations, summary, executionTime);

        // 6. Build response
        return ClassroomSimulationResponse.builder()
                .simulationId(simResult.getId())
                .status("COMPLETED")
                .executionTimeMs(executionTime)
                .totalRoomsEvaluated(candidates.size())
                .totalRecommendations(recommendations.size())
                .summary(summary)
                .inputParameters(request)
                .recommendations(recommendations)
                .build();
    }

    @Transactional(readOnly = true)
    public ClassroomSimulationResponse getSimulationById(Long id) {
        SimulationResult result = simulationResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Simulation result not found with id: " + id));

        try {
            ClassroomSimulationRequest inputParams = objectMapper.readValue(
                    result.getParameters(), ClassroomSimulationRequest.class);
            List<ClassroomRecommendation> recommendations = objectMapper.readValue(
                    result.getResults(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ClassroomRecommendation.class));

            return ClassroomSimulationResponse.builder()
                    .simulationId(result.getId())
                    .status(result.getStatus().name())
                    .executionTimeMs(result.getExecutionTimeMs())
                    .totalRoomsEvaluated(0)
                    .totalRecommendations(recommendations.size())
                    .summary(result.getSummary())
                    .inputParameters(inputParams)
                    .recommendations(recommendations)
                    .build();

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse simulation data", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ClassroomSimulationResponse> getRecentSimulations() {
        return simulationResultRepository
                .findTop10BySimulationTypeOrderByCreatedAtDesc(SimulationType.CLASSROOM_ALLOCATION)
                .stream()
                .map(result -> {
                    try {
                        ClassroomSimulationRequest inputParams = objectMapper.readValue(
                                result.getParameters(), ClassroomSimulationRequest.class);
                        return ClassroomSimulationResponse.builder()
                                .simulationId(result.getId())
                                .status(result.getStatus().name())
                                .executionTimeMs(result.getExecutionTimeMs())
                                .summary(result.getSummary())
                                .inputParameters(inputParams)
                                .totalRecommendations(0)
                                .build();
                    } catch (JsonProcessingException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private SimulationResult saveSimulationResult(
            ClassroomSimulationRequest request,
            List<ClassroomRecommendation> recommendations,
            String summary,
            long executionTime) {
        try {
            SimulationResult result = SimulationResult.builder()
                    .simulationType(SimulationType.CLASSROOM_ALLOCATION)
                    .simulationName("Classroom Allocation - " + request.getStudentCount() + " students")
                    .parameters(objectMapper.writeValueAsString(request))
                    .results(objectMapper.writeValueAsString(recommendations))
                    .summary(summary)
                    .executionTimeMs(executionTime)
                    .status(SimulationStatus.COMPLETED)
                    .startedAt(LocalDateTime.now().minus(executionTime, ChronoUnit.MILLIS))
                    .completedAt(LocalDateTime.now())
                    .build();

            return simulationResultRepository.save(result);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize simulation data", e);
        }
    }

    private String buildSummary(ClassroomSimulationRequest request,
            List<ClassroomRecommendation> recommendations, int totalEvaluated) {
        long available = recommendations.stream()
                .filter(r -> "AVAILABLE".equals(r.getAvailabilityStatus())).count();
        String bestRoom = recommendations.isEmpty() ? "N/A"
                : recommendations.get(0).getRoomNumber() + " (" + recommendations.get(0).getBuildingCode() + ")";

        return String.format(
                "Evaluated %d classrooms for %d students. Found %d recommendations (%d available in requested slot). " +
                        "Best match: %s with %.1f%% suitability score.",
                totalEvaluated, request.getStudentCount(), recommendations.size(),
                available, bestRoom,
                recommendations.isEmpty() ? 0 : recommendations.get(0).getSuitabilityScore());
    }

    // ======== Parsing Helpers ========

    private RoomType parseRoomType(String type) {
        if (type == null || type.isBlank())
            return null;
        try {
            return RoomType.valueOf(type.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private DayOfWeek parseDayOfWeek(String day) {
        if (day == null || day.isBlank())
            return null;
        try {
            return DayOfWeek.valueOf(day.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private LocalTime parseTime(String time) {
        if (time == null || time.isBlank())
            return null;
        try {
            return LocalTime.parse(time, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception e) {
            return null;
        }
    }
}
