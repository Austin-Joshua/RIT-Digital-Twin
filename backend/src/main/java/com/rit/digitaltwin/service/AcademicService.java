package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AcademicService {
    private final MarksRepository marksRepository;
    private final AttendanceRepository attendanceRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CGPARepository cgpaRepository;

    public Marks saveMarks(Long studentId, Long subjectId, Long facultyId, Double internal, Double lab) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        Marks marks = marksRepository.findByStudentIdAndSubjectSubjectId(studentId, subjectId)
                .orElse(Marks.builder().student(student).subject(subject).generatedBy(faculty).build());

        marks.setInternalMarks(internal);
        marks.setLabMarks(lab);
        marks.setTotalMarks((internal != null ? internal : 0) + (lab != null ? lab : 0));
        return marksRepository.save(marks);
    }

    public Attendance recordAttendance(Long studentId, Long subjectId, Long facultyId, LocalDate date, String status) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        Attendance attendance = Attendance.builder()
                .student(student)
                .subject(subject)
                .recordedBy(faculty)
                .date(date)
                .status(status)
                .build();
        return attendanceRepository.save(attendance);
    }

    public Faculty getFacultyByUserId(Long userId) {
        return facultyRepository.findByUserUserId(userId).orElseThrow(() -> new RuntimeException("Faculty not found"));
    }

    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserUserId(userId).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Set<Subject> getFacultySubjects(Long facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        return faculty.getAssignedSubjects();
    }

    public List<Marks> getStudentMarks(Long studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<CGPA> getStudentCGPA(Long studentId) {
        return cgpaRepository.findByStudentStudentId(studentId);
    }

    public Double calculateCGPA(Long studentId) {
        List<CGPA> semesters = cgpaRepository.findByStudentStudentId(studentId);
        if (semesters.isEmpty())
            return 0.0;
        double sum = 0;
        int totalCredits = 0;
        for (CGPA cgpa : semesters) {
            sum += (cgpa.getGpa() != null ? cgpa.getGpa() : 0)
                    * (cgpa.getTotalCredits() != null ? cgpa.getTotalCredits() : 0);
            totalCredits += (cgpa.getTotalCredits() != null ? cgpa.getTotalCredits() : 0);
        }
        return totalCredits > 0 ? (sum / totalCredits) : 0.0;
    }

    public Double calculateAttendancePercentage(Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        if (attendances.isEmpty())
            return 0.0;
        long presentCount = attendances.stream()
                .filter(a -> a.getStatus().equalsIgnoreCase("PRESENT") || a.getStatus().equalsIgnoreCase("ON_DUTY"))
                .count();
        return ((double) presentCount / attendances.size()) * 100;
    }
}
