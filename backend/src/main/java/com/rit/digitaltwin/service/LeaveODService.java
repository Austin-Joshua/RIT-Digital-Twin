package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveODService {

    private final LeaveApplicationRepository leaveApplicationRepository;
    private final ODApplicationRepository odApplicationRepository;
    private final FacultyRepository facultyRepository;
    private final NotificationService notificationService;

    @Transactional
    public LeaveApplication applyLeave(LeaveApplication leave) {
        leave.setStatus("PENDING");
        LeaveApplication saved = leaveApplicationRepository.save(leave);

        // Notify assigned faculty (simplified: notify all for now or specific if
        // linked)
        notificationService.broadcastGlobal("New Leave Application",
                "Student " + leave.getStudent().getUser().getFirstName() + " has applied for leave.",
                "LEAVE");

        return saved;
    }

    @Transactional
    public LeaveApplication updateLeaveStatus(Long leaveId, String status, Long facultyId) {
        LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave application not found"));

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        leave.setStatus(status);
        leave.setApprovedBy(faculty);

        notificationService.broadcastGlobal("Leave Status Updated",
                "Your leave application has been " + status.toLowerCase(),
                "LEAVE");

        return leaveApplicationRepository.save(leave);
    }

    @Transactional
    public ODApplication applyOD(ODApplication od) {
        od.setStatus("PENDING");
        return odApplicationRepository.save(od);
    }

    @Transactional
    public ODApplication updateODStatus(Long odId, String status) {
        ODApplication od = odApplicationRepository.findById(odId)
                .orElseThrow(() -> new RuntimeException("OD application not found"));
        od.setStatus(status);
        return odApplicationRepository.save(od);
    }

    public List<LeaveApplication> getStudentLeaves(Long studentId) {
        return leaveApplicationRepository.findByStudentId(studentId);
    }

    public List<ODApplication> getStudentODs(Long studentId) {
        return odApplicationRepository.findByStudentId(studentId);
    }
}
