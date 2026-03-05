package com.university.erp.repository;

import com.university.erp.entity.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {
    java.util.List<TransportRoute> findByRouteNumberContainingIgnoreCaseOrRouteNameContainingIgnoreCase(
            String routeNumber, String routeName);
}
