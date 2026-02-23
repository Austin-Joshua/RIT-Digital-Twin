package com.rit.digitaltwin.controller;

import com.rit.digitaltwin.dto.CgpaSimulationRequest;
import com.rit.digitaltwin.dto.CgpaSimulationResponse;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.repository.StudentRepository;
import com.rit.digitaltwin.service.CGPASimulatorService;
import com.rit.digitaltwin.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cgpa")
@RequiredArgsConstructor
public class CgpaController {

    private final CGPASimulatorService cgpaSimulatorService;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;

    @PostMapping("/simulate")
    public ResponseEntity<CgpaSimulationResponse> simulateCgpa(@RequestBody CgpaSimulationRequest request) {

        Student student = studentRepository.findById(request.getStudentId()).orElseThrow();
        Double currentCgpa = student.getCurrentCgpa() != null ? student.getCurrentCgpa() : 0.0;

        Double projectedSgpa = cgpaSimulatorService.simulateProjectedSemesterGPA(request.getStudentId(),
                request.getExpectedGrades());
        Double projectedCgpa = cgpaSimulatorService.simulateProjectedCGPA(request.getStudentId(),
                request.getExpectedGrades(), request.getCurrentCompletedCredits());

        String trend = "STABLE";
        if (projectedCgpa > currentCgpa) {
            trend = "IMPROVING";
        } else if (projectedCgpa < currentCgpa) {
            trend = "DECLINING";
        }

        // Auto notification logic
        if (student.getUser() != null) {
            notificationService.sendToUser(
                    student.getUser().getUserId(),
                    "CGPA Simulation Completed",
                    "Your projected CGPA is calculated to be " + String.format("%.2f", projectedCgpa)
                            + ". Keep up the good work!",
                    "INFO");
        }

        CgpaSimulationResponse response = CgpaSimulationResponse.builder()
                .currentCgpa(currentCgpa)
                .projectedSgpa(projectedSgpa)
                .projectedCgpa(projectedCgpa)
                .trend(trend)
                .build();

        return ResponseEntity.ok(response);
    }
}
