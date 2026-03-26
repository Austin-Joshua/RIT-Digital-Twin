package com.university.erp.controller;

import com.university.erp.entity.TransportRoute;
import com.university.erp.entity.BusStop;
import com.university.erp.entity.StudentTransportMapping;
import com.university.erp.repository.StudentTransportRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.service.TransportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportService transportService;
    private final StudentTransportRepository studentTransportRepository;
    private final StudentRepository studentRepository;

    public TransportController(TransportService transportService, StudentTransportRepository studentTransportRepository, StudentRepository studentRepository) {
        this.transportService = transportService;
        this.studentTransportRepository = studentTransportRepository;
        this.studentRepository = studentRepository;
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

    @PostMapping("/routes")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public TransportRoute createRoute(@RequestBody TransportRoute route) {
        return transportService.createRoute(route);
    }

    @PostMapping("/routes/{routeId}/stops")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public BusStop addStop(@PathVariable Long routeId, @RequestBody BusStop stop) {
        return transportService.addStopToRoute(routeId, stop);
    }

    @PostMapping("/assign")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public StudentTransportMapping assignStudent(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        Long routeId = Long.valueOf(payload.get("routeId").toString());
        String pickupPoint = payload.get("pickupPoint").toString();

        StudentTransportMapping mapping = new StudentTransportMapping();
        mapping.setStudent(studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found")));
        mapping.setRoute(transportService.getAllRoutes().stream().filter(r -> r.getId().equals(routeId)).findFirst().orElseThrow());
        mapping.setPickupPoint(pickupPoint);
        return studentTransportRepository.save(mapping);
    }
}
