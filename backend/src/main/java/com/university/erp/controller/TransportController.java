package com.university.erp.controller;

import com.university.erp.model.TransportRoute;
import com.university.erp.model.BusStop;
import com.university.erp.service.TransportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = "*")
public class TransportController {

    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping("/routes")
    public List<TransportRoute> getAllRoutes() {
        return transportService.getAllRoutes();
    }

    @GetMapping("/routes/{id}/stops")
    public List<BusStop> getStopsByRoute(@PathVariable Long id) {
        return transportService.getStopsByRoute(id);
    }

    @GetMapping("/search")
    public List<TransportRoute> searchRoutes(@RequestParam String query) {
        return transportService.searchRoutes(query);
    }
}
