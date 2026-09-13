package com.university.erp.repository;

import com.university.erp.model.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, Long> {
    @Query("select s from BusStop s join fetch s.route order by s.stopOrder asc")
    List<BusStop> findAllWithRoute();

    @Query("select s from BusStop s join fetch s.route r where r.id = :routeId order by s.stopOrder asc")
    List<BusStop> findByRouteIdOrderByStopOrderAsc(@Param("routeId") Long routeId);

    List<BusStop> findByStopNameContainingIgnoreCase(String stopName);
}
