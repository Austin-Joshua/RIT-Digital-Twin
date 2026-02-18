package com.rit.digitaltwin.repository;

import com.rit.digitaltwin.model.Classroom;
import com.rit.digitaltwin.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    List<Classroom> findByIsAvailableTrue();

    List<Classroom> findByCapacityGreaterThanEqualAndIsAvailableTrue(Integer capacity);

    List<Classroom> findByRoomTypeAndIsAvailableTrue(RoomType roomType);

    @Query("SELECT c FROM Classroom c JOIN FETCH c.building WHERE c.isAvailable = true AND c.capacity >= :minCapacity ORDER BY c.capacity ASC")
    List<Classroom> findAvailableByMinCapacity(@Param("minCapacity") Integer minCapacity);

    @Query("SELECT c FROM Classroom c JOIN FETCH c.building WHERE c.isAvailable = true AND c.capacity >= :minCapacity AND c.roomType = :roomType ORDER BY c.capacity ASC")
    List<Classroom> findAvailableByMinCapacityAndType(@Param("minCapacity") Integer minCapacity,
            @Param("roomType") RoomType roomType);

    @Query("SELECT COUNT(c) FROM Classroom c WHERE c.isAvailable = true")
    long countAvailable();
}
