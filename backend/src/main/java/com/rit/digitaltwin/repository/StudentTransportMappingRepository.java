package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.StudentTransportMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentTransportMappingRepository extends JpaRepository<StudentTransportMapping, Long> {
    List<StudentTransportMapping> findByRouteRouteId(Long routeId);

    List<StudentTransportMapping> findByStudentId(Long studentId);
}
