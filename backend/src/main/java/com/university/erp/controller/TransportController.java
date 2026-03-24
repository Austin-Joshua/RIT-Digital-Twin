package com.university.erp.controller;

import com.university.erp.entity.TransportRoute;
import com.university.erp.entity.BusStop;
import com.university.erp.entity.StudentTransportMapping;
import com.university.erp.repository.StudentTransportRepository;
import com.university.erp.service.TransportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportService transportService;
    private final StudentTransportRepository studentTransportRepository;

    public TransportController(TransportService transportService, StudentTransportRepository studentTransportRepository) {
        this.transportService = transportService;
        this.studentTransportRepository = studentTransportRepository;
    }

    @GetMapping("/routes")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public List<TransportRoute> getAllRoutes() {
        return transportService.getAllRoutes();
    }

    @GetMapping("/routes/{id}/stops")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public List<BusStop> getStopsByRoute(@PathVariable @org.springframework.lang.NonNull Long id) {
        java.util.Objects.requireNonNull(id, "route id must not be null");
        return transportService.getStopsByRoute(id);
    }

    @GetMapping("/search")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public List<TransportRoute> searchRoutes(@RequestParam @org.springframework.lang.NonNull String query) {
        java.util.Objects.requireNonNull(query, "search query must not be null");
        return transportService.searchRoutes(query);
    }

    @GetMapping("/routes/student/{studentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public Map<String, Object> getStudentRoute(@PathVariable @org.springframework.lang.NonNull Long studentId) {
        java.util.Objects.requireNonNull(studentId, "student id must not be null");
        List<StudentTransportMapping> mappings = studentTransportRepository.findByStudentId(studentId);
        if (mappings.isEmpty()) {
            return Map.of();
        }
        StudentTransportMapping m = mappings.get(0);
        return Map.of(
                "studentId", studentId,
                "pickupPoint", m.getPickupPoint() == null ? "" : m.getPickupPoint(),
                "route", m.getRoute()
        );
    }
}
