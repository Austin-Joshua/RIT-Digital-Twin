package com.university.erp.repository;

import com.university.erp.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, Long> {
    List<BusStop> findByRouteIdOrderByStopOrderAsc(Long routeId);

    List<BusStop> findByStopNameContainingIgnoreCase(String stopName);
}
