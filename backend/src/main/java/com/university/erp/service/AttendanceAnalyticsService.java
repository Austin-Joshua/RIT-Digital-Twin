package com.university.erp.service;

import com.university.erp.model.AttendanceRecord;
import com.university.erp.model.AttendanceRisk;
import com.university.erp.model.Student;
import com.university.erp.repository.AttendanceRecordRepository;
import com.university.erp.repository.AttendanceRiskRepository;
import com.university.erp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceAnalyticsService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceRiskRepository attendanceRiskRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public void runAttendanceAnalysisForAllStudents() {
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            analyzeStudentAttendance(student);
        }
    }

    @Transactional
    public AttendanceRisk analyzeStudentAttendance(Student student) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentSubject_Student_Id(student.getId());
        if (records.isEmpty()) return null;

        long total = records.size();
        long present = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getStatus())).count();
        double percentage = (present * 100.0) / total;

        // Simple Trend detection: Compare last 10 records with overall
        List<AttendanceRecord> last10 = records.stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .limit(10)
                .toList();
        
        long last10Present = last10.stream().filter(r -> "Present".equalsIgnoreCase(r.getStatus())).count();
        double last10Percentage = (last10Present * 100.0) / last10.size();

        String trend = "Stable";
        if (last10Percentage < percentage - 5) trend = "Declining";
        else if (last10Percentage > percentage + 5) trend = "Improving";

        String riskLevel = "Low";
        if (percentage < 75 || (percentage < 80 && "Declining".equals(trend))) riskLevel = "High";
        else if (percentage < 85 || "Declining".equals(trend)) riskLevel = "Medium";

        AttendanceRisk risk = AttendanceRisk.builder()
                .student(student)
                .currentPercentage(percentage)
                .riskLevel(riskLevel)
                .trend(trend)
                .analyzedAt(LocalDateTime.now())
                .notificationStatus("Pending")
                .build();

        return attendanceRiskRepository.save(risk);
    }
}
