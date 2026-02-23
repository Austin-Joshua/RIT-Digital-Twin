package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final ODApplicationRepository odApplicationRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public LeaveApplication applyLeave(Long studentId, LocalDate start, LocalDate end, String reason,
            String documentUrl) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        LeaveApplication leave = LeaveApplication.builder()
                .student(student)
                .startDate(start)
                .endDate(end)
                .reason(reason)
                .documentUrl(documentUrl)
                .status("PENDING")
                .build();
        return leaveApplicationRepository.save(leave);
    }

    public ODApplication applyOD(Long studentId, LocalDate date, String eventName, String reason, String documentUrl) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        ODApplication od = ODApplication.builder()
                .student(student)
                .date(date)
                .eventName(eventName)
                .reason(reason)
                .documentUrl(documentUrl)
                .status("PENDING")
                .build();
        return odApplicationRepository.save(od);
    }

    public LeaveApplication reviewLeave(Long leaveId, Long facultyId, String status) {
        LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        leave.setStatus(status);
        leave.setApprovedBy(faculty);
        return leaveApplicationRepository.save(leave);
    }

    public ODApplication reviewOD(Long odId, Long facultyId, String status) {
        ODApplication od = odApplicationRepository.findById(odId)
                .orElseThrow(() -> new RuntimeException("OD not found"));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        od.setStatus(status);
        od.setApprovedBy(faculty);
        return odApplicationRepository.save(od);
    }

    public List<LeaveApplication> getStudentLeaves(Long studentId) {
        return leaveApplicationRepository.findByStudentId(studentId);
    }

    public List<ODApplication> getStudentODs(Long studentId) {
        return odApplicationRepository.findByStudentId(studentId);
    }

    public List<LeaveApplication> getPendingLeaves() {
        return leaveApplicationRepository.findByStatus("PENDING");
    }

    public List<ODApplication> getPendingODs() {
        return odApplicationRepository.findByStatus("PENDING");
    }
}
