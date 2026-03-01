package com.university.erp.service;

import com.university.erp.exception.ErpException;
import com.university.erp.model.Marks;
import com.university.erp.model.Student;
import com.university.erp.repository.MarksRepository;
import com.university.erp.repository.MarkHistoryRepository;
import com.university.erp.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.university.erp.dto.MarksUploadRequestDto;
import com.university.erp.model.Subject;
import com.university.erp.repository.SubjectRepository;

import java.util.List;

@Service
public class AcademicService {

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final AuditService auditService;
    private final InternalMarkCalculationService calculationService;
    private final MarkHistoryRepository historyRepository;
    private final SubjectRepository subjectRepository;

    public AcademicService(MarksRepository marksRepository, StudentRepository studentRepository,
            AuditService auditService, InternalMarkCalculationService calculationService,
            MarkHistoryRepository historyRepository, SubjectRepository subjectRepository) {
        this.marksRepository = marksRepository;
        this.studentRepository = studentRepository;
        this.auditService = auditService;
        this.calculationService = calculationService;
        this.historyRepository = historyRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional
    public void enterMarks(@org.springframework.lang.NonNull Long studentId, @org.springframework.lang.NonNull Marks newMarks) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        java.util.Objects.requireNonNull(newMarks, "newMarks must not be null");
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));

        Marks existingMarks = marksRepository.findById(newMarks.getId() != null ? newMarks.getId() : -1L)
                .orElse(new Marks());
        java.util.Objects.requireNonNull(existingMarks, "existingMarks should not be null");

        if (existingMarks.getId() != null) {
            logHistory(existingMarks, newMarks);
        }

        newMarks.setStudent(student);
        calculationService.calculateAll(newMarks);
        marksRepository.save(newMarks);

        recalculateCgpa(studentId);

        auditService.log("MARKS_ENTRY", "Updated marks for student: " + student.getStudentIdNumber() +
                " in subject ID: " + newMarks.getSubject().getId());
    }

    @Transactional
    public void bulkUploadMarks(List<MarksUploadRequestDto> payload) {
        int count = 0;
        for (MarksUploadRequestDto dto : payload) {
            // Find Student by RegNo or Email
            Student student = studentRepository.findByStudentIdNumber(dto.getStudentIdentifier())
                    .orElseGet(() -> {
                        // Fallback to checking by User Email if RegNo isn't found
                        return studentRepository.findAll().stream()
                                .filter(s -> s.getUser() != null
                                        && s.getUser().getEmail().equalsIgnoreCase(dto.getStudentIdentifier()))
                                .findFirst().orElse(null);
                    });

            if (student == null) {
                System.err.println("Student not found for identifier: " + dto.getStudentIdentifier());
                continue;
            }

            // Find Subject by Code
            Subject subject = subjectRepository.findBySubjectCode(dto.getSubjectCode())
                    .orElse(null);

            if (subject == null) {
                System.err.println("Subject not found for code: " + dto.getSubjectCode());
                continue;
            }

            // Find existing marks or create new
            Marks mark = marksRepository.findByStudentId(student.getId()).stream()
                    .filter(m -> m.getSubject().getId().equals(subject.getId()))
                    .findFirst()
                    .orElse(new Marks());

            mark.setStudent(student);
            mark.setSubject(subject);

            // Safe assignment with null checks
            if (dto.getCat1() != null)
                mark.setCat1Score(dto.getCat1());
            if (dto.getCat2() != null)
                mark.setCat2Score(dto.getCat2());
            if (dto.getCat3() != null)
                mark.setCat3Score(dto.getCat3());
            if (dto.getAssignment() != null)
                mark.setAssignmentScore(dto.getAssignment());
            if (dto.getSemesterGrade() != null && !dto.getSemesterGrade().isEmpty())
                mark.setGrade(dto.getSemesterGrade());
            if (mark.getSemester() == null)
                mark.setSemester(1); // Default

            calculationService.calculateAll(mark);
            marksRepository.save(mark);

            // Re-calc CGPA for the student
            recalculateCgpa(student.getId());
            count++;
        }

        auditService.log("BULK_MARKS_UPLOAD",
                "Faculty successfully processed " + count + " academic records via bulk Excel upload.");
    }

    private void logHistory(Marks oldMarks, Marks newMarks) {
        trackChange(oldMarks, newMarks, "cat1Score", String.valueOf(oldMarks.getCat1Score()),
                String.valueOf(newMarks.getCat1Score()));
        trackChange(oldMarks, newMarks, "cat2Score", String.valueOf(oldMarks.getCat2Score()),
                String.valueOf(newMarks.getCat2Score()));
        trackChange(oldMarks, newMarks, "cat3Score", String.valueOf(oldMarks.getCat3Score()),
                String.valueOf(newMarks.getCat3Score()));
        trackChange(oldMarks, newMarks, "assignmentScore", String.valueOf(oldMarks.getAssignmentScore()),
                String.valueOf(newMarks.getAssignmentScore()));
        trackChange(oldMarks, newMarks, "attendancePercentage", String.valueOf(oldMarks.getAttendancePercentage()),
                String.valueOf(newMarks.getAttendancePercentage()));
        trackChange(oldMarks, newMarks, "finalExamScore", String.valueOf(oldMarks.getFinalExamScore()),
                String.valueOf(newMarks.getFinalExamScore()));
    }

    private void trackChange(Marks mark, Marks newMark, String field, String oldVal, String newVal) {
        if (oldVal != null && !oldVal.equals(newVal)) {
            com.university.erp.model.MarkHistory hist = com.university.erp.model.MarkHistory.builder()
                    .mark(mark)
                    .fieldName(field)
                    .oldValue(oldVal)
                    .newValue(newVal)
                    .changedBy("SYSTEM")
                    .build();
            java.util.Objects.requireNonNull(hist, "history entry must not be null");
            historyRepository.save(hist);
        }
    }

    public List<Marks> getStudentMarks(Long studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    @Transactional
    public void recalculateCgpa(@org.springframework.lang.NonNull Long studentId) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        // ensure student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));
        // use fetched student later
        // (existing logic below uses studentRepository again, so we could reuse variable)

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
