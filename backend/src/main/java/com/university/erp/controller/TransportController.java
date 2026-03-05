package com.university.erp.controller;

import com.university.erp.entity.TransportRoute;
import com.university.erp.entity.BusStop;
import com.university.erp.service.TransportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping("/routes")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public List<TransportRoute> getAllRoutes() {
        return transportService.getAllRoutes();
    }

    @GetMapping("/routes/{id}/stops")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public List<BusStop> getStopsByRoute(@PathVariable @org.springframework.lang.NonNull Long id) {
        java.util.Objects.requireNonNull(id, "route id must not be null");
        return transportService.getStopsByRoute(id);
    }

    @GetMapping("/search")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HOD','FACULTY','STUDENT','PARENT')")
    public List<TransportRoute> searchRoutes(@RequestParam @org.springframework.lang.NonNull String query) {
        java.util.Objects.requireNonNull(query, "search query must not be null");
        return transportService.searchRoutes(query);
    }
}
