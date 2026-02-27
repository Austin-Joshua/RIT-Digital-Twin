package com.university.erp.service;

import com.university.erp.model.TransportRoute;
import com.university.erp.model.BusStop;
import com.university.erp.repository.TransportRouteRepository;
import com.university.erp.repository.BusStopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportService {

    private final TransportRouteRepository routeRepository;
    private final BusStopRepository stopRepository;

    public TransportService(TransportRouteRepository routeRepository, BusStopRepository stopRepository) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
    }

    public List<TransportRoute> getAllRoutes() {
        return routeRepository.findAll();
    }

    public void updateRoute(Long id, TransportRoute updatedRoute) {
        TransportRoute existing = routeRepository.findById(id).orElseThrow();
        existing.setRouteName(updatedRoute.getRouteName());
        existing.setRouteNumber(updatedRoute.getRouteNumber());
        existing.setStartPoint(updatedRoute.getStartPoint());
        existing.setEndPoint(updatedRoute.getEndPoint());
        existing.setBusNumber(updatedRoute.getBusNumber());
        existing.setCoordinatorName(updatedRoute.getCoordinatorName());
        existing.setCoordinatorPhone(updatedRoute.getCoordinatorPhone());
        routeRepository.save(existing);
    }

    public List<BusStop> getStopsByRoute(Long routeId) {
        return stopRepository.findByRouteIdOrderByStopOrderAsc(routeId);
    }

    public List<TransportRoute> searchRoutes(String query) {
        // Search by route number or by stop name
        List<TransportRoute> routesByNumber = routeRepository.findAll().stream()
                .filter(r -> r.getRouteNumber().toLowerCase().contains(query.toLowerCase()) ||
                        r.getRouteName().toLowerCase().contains(query.toLowerCase()))
                .toList();

        if (!routesByNumber.isEmpty())
            return routesByNumber;

        return stopRepository.findByStopNameContainingIgnoreCase(query).stream()
                .map(BusStop::getRoute)
                .distinct()
                .toList();
    }
}
