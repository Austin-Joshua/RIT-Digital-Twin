package com.university.erp.service;

import com.university.erp.entity.TransportRoute;
import com.university.erp.entity.BusStop;
import com.university.erp.repository.TransportRouteRepository;
import com.university.erp.repository.BusStopRepository;
import org.springframework.cache.annotation.Cacheable;
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

    @Cacheable("transportRoutes")
    public List<TransportRoute> getAllRoutes() {
        return routeRepository.findAll();
    }

    public void updateRoute(@org.springframework.lang.NonNull Long id, @org.springframework.lang.NonNull TransportRoute updatedRoute) {
        java.util.Objects.requireNonNull(id, "id must not be null");
        java.util.Objects.requireNonNull(updatedRoute, "updatedRoute must not be null");
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

    @Cacheable(cacheNames = "routeStops", key = "#routeId")
    public List<BusStop> getStopsByRoute(@org.springframework.lang.NonNull Long routeId) {
        java.util.Objects.requireNonNull(routeId, "routeId must not be null");
        return stopRepository.findByRouteIdOrderByStopOrderAsc(routeId);
    }

    public List<TransportRoute> searchRoutes(@org.springframework.lang.NonNull String query) {
        java.util.Objects.requireNonNull(query, "query must not be null");
        String normalized = query.trim().toLowerCase();

        List<TransportRoute> routesByNumberOrName =
                routeRepository.findByRouteNumberContainingIgnoreCaseOrRouteNameContainingIgnoreCase(normalized, normalized);

        if (!routesByNumberOrName.isEmpty()) {
            return routesByNumberOrName;
        }

        return stopRepository.findByStopNameContainingIgnoreCase(normalized).stream()
                .map(BusStop::getRoute)
                .distinct()
                .toList();
    }

    public TransportRoute createRoute(TransportRoute route) {
        return routeRepository.save(route);
    }

    public BusStop addStopToRoute(Long routeId, BusStop stop) {
        TransportRoute route = routeRepository.findById(routeId).orElseThrow();
        stop.setRoute(route);
        return stopRepository.save(stop);
    }
}
