package com.rit.digitaltwin.simulation;

import com.rit.digitaltwin.dto.ClassroomSimulationRequest;
import com.rit.digitaltwin.dto.ClassroomSimulationResponse.ClassroomRecommendation;
import com.rit.digitaltwin.model.Classroom;
import java.time.DayOfWeek;
import com.rit.digitaltwin.model.Timetable;
import com.rit.digitaltwin.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core engine for classroom allocation logic.
 * Decouples calculation from service orchestration.
 */
@Component
@RequiredArgsConstructor
public class AllocationEngine {

    private final TimetableRepository timetableRepository;

    // Scoring weights
    private static final double WEIGHT_CAPACITY_FIT = 0.40;
    private static final double WEIGHT_AMENITIES = 0.25;
    private static final double WEIGHT_AVAILABILITY = 0.25;
    private static final double WEIGHT_FLOOR_PREF = 0.10;

    public ClassroomRecommendation evaluateClassroom(
            Classroom classroom,
            ClassroomSimulationRequest request,
            DayOfWeek day,
            LocalTime startSlot,
            LocalTime endSlot) {

        double capacityScore = calculateCapacityScore(classroom.getCapacity(), request.getStudentCount());
        double amenityScore = calculateAmenityScore(classroom, request);
        double availabilityScore = 1.0;
        List<String> conflicts = new ArrayList<>();
        String availabilityStatus = "AVAILABLE";

        if (day != null && startSlot != null && endSlot != null) {
            List<Timetable> conflicting = timetableRepository.findConflictingSlots(
                    classroom.getId(), day, startSlot, endSlot);

            if (!conflicting.isEmpty()) {
                availabilityScore = 0.0;
                availabilityStatus = "OCCUPIED";
                conflicts = conflicting.stream()
                        .map(t -> String.format("%s (%s-%s) - %s",
                                t.getSubjectName(),
                                t.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                                t.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                                t.getDepartment() != null ? t.getDepartment().getCode() : "N/A"))
                        .collect(Collectors.toList());
            }
        }

        double floorScore = calculateFloorScore(classroom.getFloor());
        double totalScore = ((capacityScore * WEIGHT_CAPACITY_FIT) +
                (amenityScore * WEIGHT_AMENITIES) +
                (availabilityScore * WEIGHT_AVAILABILITY) +
                (floorScore * WEIGHT_FLOOR_PREF)) * 100;

        totalScore = BigDecimal.valueOf(totalScore).setScale(1, RoundingMode.HALF_UP).doubleValue();
        int wastedCapacity = classroom.getCapacity() - request.getStudentCount();
        double utilization = BigDecimal.valueOf((double) request.getStudentCount() / classroom.getCapacity() * 100)
                .setScale(1, RoundingMode.HALF_UP).doubleValue();

        return ClassroomRecommendation.builder()
                .classroomId(classroom.getId())
                .roomNumber(classroom.getRoomNumber())
                .buildingName(classroom.getBuilding().getName())
                .buildingCode(classroom.getBuilding().getCode())
                .floor(classroom.getFloor())
                .capacity(classroom.getCapacity())
                .roomType(classroom.getRoomType().name())
                .hasProjector(classroom.getHasProjector())
                .hasAc(classroom.getHasAc())
                .hasSmartBoard(classroom.getHasSmartBoard())
                .hasWifi(classroom.getHasWifi())
                .utilizationPercent(utilization)
                .wastedCapacity(wastedCapacity)
                .suitabilityScore(totalScore)
                .availabilityStatus(availabilityStatus)
                .conflictingSlots(conflicts)
                .build();
    }

    private double calculateCapacityScore(int capacity, int studentCount) {
        double utilization = (double) studentCount / capacity;
        if (utilization >= 0.85 && utilization <= 0.95)
            return 1.0;
        if (utilization >= 0.70 && utilization < 0.85)
            return 0.9;
        if (utilization >= 0.50 && utilization < 0.70)
            return 0.7;
        if (utilization >= 0.30 && utilization < 0.50)
            return 0.4;
        return 0.2;
    }

    private double calculateAmenityScore(Classroom classroom, ClassroomSimulationRequest request) {
        int total = 0;
        int matched = 0;
        if (Boolean.TRUE.equals(request.getRequireAc())) {
            total++;
            if (Boolean.TRUE.equals(classroom.getHasAc()))
                matched++;
        }
        if (Boolean.TRUE.equals(request.getRequireProjector())) {
            total++;
            if (Boolean.TRUE.equals(classroom.getHasProjector()))
                matched++;
        }
        if (Boolean.TRUE.equals(request.getRequireSmartBoard())) {
            total++;
            if (Boolean.TRUE.equals(classroom.getHasSmartBoard()))
                matched++;
        }
        if (total == 0)
            return 1.0;
        return (double) matched / total;
    }

    private double calculateFloorScore(int floor) {
        if (floor <= 1)
            return 1.0;
        if (floor == 2)
            return 0.8;
        if (floor == 3)
            return 0.6;
        return 0.4;
    }
}
