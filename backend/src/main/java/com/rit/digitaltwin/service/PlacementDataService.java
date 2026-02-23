package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.PlacementData;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.repository.PlacementDataRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlacementDataService {

    private final PlacementDataRepository placementDataRepository;
    private final StudentRepository studentRepository;

    public List<PlacementData> getAllPlacementData() {
        return placementDataRepository.findAll();
    }

    public PlacementData getPlacementDataForStudent(Long studentId) {
        return placementDataRepository.findByStudentId(studentId).orElse(null);
    }

    @Transactional
    public PlacementData updatePlacementData(Long studentId, PlacementData incomingData) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        PlacementData existing = placementDataRepository.findByStudentId(studentId).orElse(new PlacementData());

        existing.setStudent(student);
        existing.setSkills(incomingData.getSkills());
        existing.setPlacedCompany(incomingData.getPlacedCompany());
        existing.setPackageCtc(incomingData.getPackageCtc());
        existing.setStatus(incomingData.getStatus());

        return placementDataRepository.save(existing);
    }
}
