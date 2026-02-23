package com.university.erp.service;

import com.university.erp.model.TransportRoute;
import com.university.erp.repository.TransportRouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportService {

    private final TransportRouteRepository routeRepository;

    public TransportService(TransportRouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<TransportRoute> getAllRoutes() {
        return routeRepository.findAll();
    }

    public void updateRoute(Long id, TransportRoute updatedRoute) {
        TransportRoute existing = routeRepository.findById(id).orElseThrow();
        existing.setRouteName(updatedRoute.getRouteName());
        existing.setStartPoint(updatedRoute.getStartPoint());
        existing.setEndPoint(updatedRoute.getEndPoint());
        routeRepository.save(existing);
    }
}
