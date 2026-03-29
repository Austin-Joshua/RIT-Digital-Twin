package com.university.erp.service;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HostelService {

    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final HostelAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public HostelAssignment assignStudentToRoom(Long studentId, Long roomId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        Room room = roomRepository.findById(roomId).orElseThrow();

        if (room.getOccupancy() >= room.getCapacity()) {
            throw new RuntimeException("Room is full");
        }

        HostelAssignment assignment = HostelAssignment.builder()
                .student(student)
                .room(room)
                .checkInDate(LocalDate.now())
                .status("Active")
                .build();

        room.setOccupancy(room.getOccupancy() + 1);
        if (room.getOccupancy().equals(room.getCapacity())) {
            room.setStatus("Full");
        }
        roomRepository.save(room);

        return assignmentRepository.save(assignment);
    }

    public List<Hostel> getAllHostels() {
        return hostelRepository.findAll();
    }

    public List<Room> getRoomsByHostel(Long hostelId) {
        return roomRepository.findByHostel_Id(hostelId);
    }
}
