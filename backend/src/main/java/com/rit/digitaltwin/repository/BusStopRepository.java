package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, Long> {
    List<BusStop> findByRoute_RouteId(Long routeId);
}
