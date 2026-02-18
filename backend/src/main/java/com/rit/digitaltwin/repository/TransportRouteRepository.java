package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {
}
