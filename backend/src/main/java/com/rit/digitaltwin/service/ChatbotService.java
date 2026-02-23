package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final AttendanceRepository attendanceRepository;
    private final CGPARepository cgpaRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;

    public String processQuery(Long studentId, String query) {
        String lowerQuery = query.toLowerCase();

        if (lowerQuery.contains("attendance")) {
            long total = attendanceRepository.findByStudentId(studentId).size();
            return "Your total recorded attendance entries are: " + total;
        } else if (lowerQuery.contains("cgpa") || lowerQuery.contains("gpa")) {
            List<CGPA> cgpas = cgpaRepository.findByStudentStudentId(studentId);
            if (cgpas.isEmpty())
                return "CGPA data not found.";
            CGPA latest = cgpas.get(0); // Assuming sorted or just picking first
            return "Your current cumulative CGPA is: " + latest.getCumulativeCgpa();
        } else if (lowerQuery.contains("leave")) {
            long pending = leaveApplicationRepository.findByStudentId(studentId).stream()
                    .filter(l -> l.getStatus().equals("PENDING")).count();
            return "You have " + pending + " pending leave applications.";
        } else if (lowerQuery.contains("hello") || lowerQuery.contains("hi")) {
            return "Hello! I am your AI Academic Assistant. You can ask me about your attendance, CGPA, or leave status.";
        }

        return "I'm sorry, I couldn't understand that. Try asking about 'attendance', 'CGPA', or 'leave status'.";
    }
}
