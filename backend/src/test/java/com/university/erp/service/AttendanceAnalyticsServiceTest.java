package com.university.erp.service;

import com.university.erp.model.AttendanceRecord;
import com.university.erp.model.AttendanceRisk;
import com.university.erp.model.Student;
import com.university.erp.repository.AttendanceRecordRepository;
import com.university.erp.repository.AttendanceRiskRepository;
import com.university.erp.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceAnalyticsServiceTest {

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;
    @Mock
    private AttendanceRiskRepository attendanceRiskRepository;
    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private AttendanceAnalyticsService attendanceAnalyticsService;

    private Student testStudent;

    @BeforeEach
    void setUp() {
        testStudent = Student.builder()
                .id(1L)
                .registerNo("2117240020044")
                .studentName("Austin Joshua")
                .build();
    }

    @Test
    @DisplayName("On-Demand Analytics: calculates high risk when attendance is below 75%")
    void testAnalyzeStudentAttendance_HighRiskAndDecliningTrend() {
        List<AttendanceRecord> records = new ArrayList<>();
        LocalDate base = LocalDate.of(2026, 1, 1);
        // 20 records total: first 10 present, last 10 absent -> 50% overall, 0% recent -> High risk, Declining
        for (int i = 0; i < 10; i++) {
            records.add(AttendanceRecord.builder().attendanceId((long) i).date(base.plusDays(i)).status("Present").build());
        }
        for (int i = 10; i < 20; i++) {
            records.add(AttendanceRecord.builder().attendanceId((long) i).date(base.plusDays(i)).status("Absent").build());
        }

        when(attendanceRecordRepository.findByStudentSubject_Student_Id(1L)).thenReturn(records);
        when(attendanceRiskRepository.save(any(AttendanceRisk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttendanceRisk risk = attendanceAnalyticsService.analyzeStudentAttendance(testStudent);

        assertNotNull(risk);
        assertEquals("High", risk.getRiskLevel());
        assertEquals("Declining", risk.getTrend());
        assertEquals(50.0, risk.getCurrentPercentage());
        verify(attendanceRiskRepository, times(1)).save(any(AttendanceRisk.class));
    }

    @Test
    @DisplayName("On-Demand Analytics: calculates low risk when attendance is 100%")
    void testAnalyzeStudentAttendance_LowRiskAndStableTrend() {
        List<AttendanceRecord> records = new ArrayList<>();
        LocalDate base = LocalDate.of(2026, 1, 1);
        for (int i = 0; i < 20; i++) {
            records.add(AttendanceRecord.builder().attendanceId((long) i).date(base.plusDays(i)).status("Present").build());
        }

        when(attendanceRecordRepository.findByStudentSubject_Student_Id(1L)).thenReturn(records);
        when(attendanceRiskRepository.save(any(AttendanceRisk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttendanceRisk risk = attendanceAnalyticsService.analyzeStudentAttendance(testStudent);

        assertNotNull(risk);
        assertEquals("Low", risk.getRiskLevel());
        assertEquals("Stable", risk.getTrend());
        assertEquals(100.0, risk.getCurrentPercentage());
    }

    @Test
    @DisplayName("On-Demand Analytics: returns null when student has zero attendance records")
    void testAnalyzeStudentAttendance_WhenNoRecords_ReturnsNull() {
        when(attendanceRecordRepository.findByStudentSubject_Student_Id(1L)).thenReturn(List.of());

        AttendanceRisk risk = attendanceAnalyticsService.analyzeStudentAttendance(testStudent);

        assertNull(risk);
        verify(attendanceRiskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Batch Analytics: iterates all students and persists risks")
    void testRunAttendanceAnalysisForAllStudents_WhenExplicitlyCalled_CalculatesRisks() {
        Student s1 = Student.builder().id(1L).registerNo("REG-01").build();
        Student s2 = Student.builder().id(2L).registerNo("REG-02").build();
        when(studentRepository.findAll()).thenReturn(List.of(s1, s2));

        List<AttendanceRecord> records = List.of(
                AttendanceRecord.builder().attendanceId(10L).date(LocalDate.now()).status("Present").build()
        );
        when(attendanceRecordRepository.findByStudentSubject_Student_Id(anyLong())).thenReturn(records);
        when(attendanceRiskRepository.save(any(AttendanceRisk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        attendanceAnalyticsService.runAttendanceAnalysisForAllStudents();

        verify(attendanceRiskRepository, times(2)).save(any(AttendanceRisk.class));
    }

    @Test
    @DisplayName("Resilience: an error in analyzing one student does not abort the cohort")
    void testRunAttendanceAnalysisForAllStudents_WhenOneStudentThrows_ContinuesWithRemaining() {
        Student s1 = Student.builder().id(1L).registerNo("REG-01").build();
        Student s2 = Student.builder().id(2L).registerNo("REG-02").build();
        when(studentRepository.findAll()).thenReturn(List.of(s1, s2));

        when(attendanceRecordRepository.findByStudentSubject_Student_Id(1L))
                .thenThrow(new RuntimeException("Transient DB issue on student 1"));
        when(attendanceRecordRepository.findByStudentSubject_Student_Id(2L))
                .thenReturn(List.of(AttendanceRecord.builder().attendanceId(20L).date(LocalDate.now()).status("Present").build()));
        when(attendanceRiskRepository.save(any(AttendanceRisk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> attendanceAnalyticsService.runAttendanceAnalysisForAllStudents());

        // Student 2 is still processed successfully despite student 1 error
        verify(attendanceRiskRepository, times(1)).save(any(AttendanceRisk.class));
    }
}
