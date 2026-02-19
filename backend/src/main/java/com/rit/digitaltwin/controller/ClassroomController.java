package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.model.Classroom;
import com.rit.digitaltwin.model.SimulationResult;
import com.rit.digitaltwin.service.ClassroomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {

    @Autowired
    private ClassroomService classroomService;

    @GetMapping
    public ResponseEntity<List<Classroom>> getAllClassrooms() {
        return ResponseEntity.ok(classroomService.getAllClassrooms());
    }

    @PostMapping("/simulate")
    public ResponseEntity<SimulationResult> runSimulation(@RequestBody Map<String, Object> params) {
        return ResponseEntity.ok(classroomService.runAllocationSimulation(params));
    }
}
