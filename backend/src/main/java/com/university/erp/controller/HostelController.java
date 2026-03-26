package com.university.erp.controller;

import com.university.erp.entity.Hostel;
import com.university.erp.entity.HostelAssignment;
import com.university.erp.entity.Room;
import com.university.erp.service.HostelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hostel")
@RequiredArgsConstructor
public class HostelController {

    private final HostelService hostelService;

    @GetMapping("/list")
    public List<Hostel> getHostels() {
        return hostelService.getAllHostels();
    }

    @GetMapping("/{hostelId}/rooms")
    public List<Room> getRooms(@PathVariable Long hostelId) {
        return hostelService.getRoomsByHostel(hostelId);
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HostelAssignment> assignRoom(@RequestBody Map<String, Long> payload) {
        return ResponseEntity.ok(hostelService.assignStudentToRoom(payload.get("studentId"), payload.get("roomId")));
    }
}
