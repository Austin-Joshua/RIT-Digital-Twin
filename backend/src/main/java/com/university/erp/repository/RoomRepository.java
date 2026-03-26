package com.university.erp.repository;

import com.university.erp.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHostel_Id(Long hostelId);
    List<Room> findByStatus(String status);
}
