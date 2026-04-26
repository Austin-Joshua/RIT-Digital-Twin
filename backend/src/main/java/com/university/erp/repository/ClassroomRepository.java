package com.university.erp.repository;

import com.university.erp.model.Classroom;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByBuilding_Id(Long buildingId);
    @Query("select c from Classroom c where c.capacity >= :minCapacity")
    List<Classroom> findByCapacityAtLeast(Integer minCapacity);
}
