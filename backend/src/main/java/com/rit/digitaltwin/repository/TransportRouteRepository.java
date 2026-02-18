package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.TransportRoute;
import com.rit.digitaltwin.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {

    Optional<TransportRoute> findByRouteCode(String routeCode);

    List<TransportRoute> findByActiveTrue();

    List<TransportRoute> findByVehicleType(VehicleType vehicleType);

    @Query("SELECT AVG(r.distanceKm) FROM TransportRoute r WHERE r.active = true")
    Double findAverageDistanceOfActiveRoutes();

    @Query("SELECT SUM(r.capacity) FROM TransportRoute r WHERE r.active = true")
    Long findTotalCapacityOfActiveRoutes();
}
