package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Attendance;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.repository.AttendanceRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceAlertService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void checkAndTriggerAlerts(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        List<Attendance> attendanceRecords = attendanceRepository.findByStudentId(studentId);

        long presentCount = attendanceRecords.stream()
                .filter(a -> "PRESENT".equals(a.getStatus()) || "ON_DUTY".equals(a.getStatus()))
                .count();
        double overallAttendance = attendanceRecords.isEmpty() ? 100.0
                : (presentCount * 100.0) / attendanceRecords.size();

        if (overallAttendance < 75.0) {
            String alertMessage = "CRITICAL ALERT: Student " + student.getUser().getFirstName()
                    + " has fallen below 75% attendance (" + String.format("%.1f", overallAttendance) + "%).";

            // Broadcast generic alert across global topic (Admins/Faculty will see)
            messagingTemplate.convertAndSend("/topic/global", alertMessage);

            // In a real scenario, we would also emit to
            // "/user/{facultyId}/topic/notifications"
        }
    }
}
