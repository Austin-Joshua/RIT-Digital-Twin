package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OperationsService {

    private final TransportRouteRepository transportRouteRepository;
    private final StudentTransportMappingRepository studentTransportMappingRepository;
    private final PlacementDataRepository placementDataRepository;
    private final ResearchPublicationRepository researchPublicationRepository;

    // Transport
    public List<TransportRoute> getAllRoutes() {
        return transportRouteRepository.findAll();
    }

    public List<StudentTransportMapping> getStudentBusRoutes(Long studentId) {
        return studentTransportMappingRepository.findByStudentId(studentId);
    }

    // Placement
    public PlacementData getStudentPlacement(Long studentId) {
        return placementDataRepository.findByStudentId(studentId).orElse(null);
    }

    public List<PlacementData> getAllPlacementRecords() {
        return placementDataRepository.findAll();
    }

    // Research
    public List<ResearchPublication> getFacultyPublications(Long facultyId) {
        return researchPublicationRepository.findByFacultyId(facultyId);
    }

    public ResearchPublication uploadPublication(ResearchPublication pub) {
        return researchPublicationRepository.save(pub);
    }
}
