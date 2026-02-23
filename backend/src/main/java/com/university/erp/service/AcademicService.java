package com.university.erp.service;

import com.university.erp.exception.ErpException;
import com.university.erp.model.Marks;
import com.university.erp.model.Student;
import com.university.erp.repository.MarksRepository;
import com.university.erp.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AcademicService {

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final AuditService auditService;

    public AcademicService(MarksRepository marksRepository, StudentRepository studentRepository,
            AuditService auditService) {
        this.marksRepository = marksRepository;
        this.studentRepository = studentRepository;
        this.auditService = auditService;
    }

    @Transactional
    public void enterMarks(Long studentId, Marks marks) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));

        marks.setStudent(student);
        marksRepository.save(marks);

        recalculateCgpa(studentId);

        auditService.log("MARKS_ENTRY", "Entered marks for student: " + student.getStudentIdNumber() +
                " in subject ID: " + marks.getSubject().getId());
    }

    public List<Marks> getStudentMarks(Long studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    @Transactional
    public void recalculateCgpa(Long studentId) {
        List<Marks> allMarks = marksRepository.findByStudentId(studentId);
        if (allMarks.isEmpty())
            return;

        double totalGradePoints = 0;
        int totalCredits = 0;

        for (Marks m : allMarks) {
            int gradePoint = convertToGradePoint(m.getGrade());
            int credits = m.getSubject().getCredits();
            totalGradePoints += (gradePoint * credits);
            totalCredits += credits;
        }

        double cgpa = totalGradePoints / totalCredits;

        Student student = studentRepository.findById(studentId).get();
        student.setCurrentCgpa(cgpa);
        studentRepository.save(student);
    }

    private int convertToGradePoint(String grade) {
        return switch (grade) {
            case "O" -> 10;
            case "A+" -> 9;
            case "A" -> 8;
            case "B+" -> 7;
            case "B" -> 6;
            case "C" -> 5;
            default -> 0;
        };
    }
}
