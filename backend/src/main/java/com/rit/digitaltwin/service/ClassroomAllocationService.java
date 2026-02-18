package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Classroom;
import com.rit.digitaltwin.model.Timetable;
import com.rit.digitaltwin.repository.ClassroomRepository;
import com.rit.digitaltwin.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomAllocationService {

    private final ClassroomRepository classroomRepository;
    private final TimetableRepository timetableRepository;

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
}
