package com.university.erp.service;

import java.util.*;
import java.util.stream.Collectors;
import com.university.erp.util.ErpException;
import com.university.erp.model.Marks;
import java.math.BigDecimal;
import java.math.RoundingMode;
import com.university.erp.model.Student;
import com.university.erp.repository.MarksRepository;
import com.university.erp.repository.MarkHistoryRepository;
import com.university.erp.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.university.erp.dto.MarksUploadRequestDto;
import com.university.erp.model.Subject;
import com.university.erp.repository.SubjectRepository;

@Service
public class AcademicService {

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final AuditService auditService;
    private final InternalMarkCalculationService calculationService;
    private final MarkHistoryRepository historyRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationService notificationService;

    public AcademicService(MarksRepository marksRepository, StudentRepository studentRepository,
            AuditService auditService, InternalMarkCalculationService calculationService,
            MarkHistoryRepository historyRepository, SubjectRepository subjectRepository,
            NotificationService notificationService) {
        this.marksRepository = marksRepository;
        this.studentRepository = studentRepository;
        this.auditService = auditService;
        this.calculationService = calculationService;
        this.historyRepository = historyRepository;
        this.subjectRepository = subjectRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void enterMarks(Long studentId, Marks newMarks) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));

        Marks existingMarks = marksRepository.findById(newMarks.getId() != null ? newMarks.getId() : -1L)
                .orElse(new Marks());

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
        if (payload == null || payload.isEmpty()) return;

        // Collect all identifiers for bulk lookup
        Set<String> studentIdentifiers = payload.stream()
                .map(MarksUploadRequestDto::getStudentIdentifier)
                .collect(Collectors.toSet());
        Set<String> subjectCodes = payload.stream()
                .map(MarksUploadRequestDto::getSubjectCode)
                .collect(Collectors.toSet());

        // Bulk lookup students and subjects (O(N) instead of O(N^2))
        Map<String, Student> studentMap = studentRepository.findAll().stream()
                .filter(s -> s.getStudentIdNumber() != null && studentIdentifiers.contains(s.getStudentIdNumber()) ||
                             (s.getUser() != null && studentIdentifiers.contains(s.getUser().getEmail())))
                .collect(Collectors.toMap(
                    s -> studentIdentifiers.contains(s.getStudentIdNumber()) ? s.getStudentIdNumber() : s.getUser().getEmail(),
                    s -> s,
                    (s1, s2) -> s1 // handle duplicates
                ));

        Map<String, Subject> subjectMap = subjectRepository.findAllBySubjectCodeIn(subjectCodes).stream()
                .collect(Collectors.toMap(Subject::getSubjectCode, s -> s));

        List<Marks> marksToSave = new ArrayList<>();
        Set<Long> affectedStudentIds = new HashSet<>();

        for (MarksUploadRequestDto dto : payload) {
            Student student = studentMap.get(dto.getStudentIdentifier());
            Subject subject = subjectMap.get(dto.getSubjectCode());

            if (student == null || subject == null) {
                continue;
            }

            // Find existing marks or create new (Optimized)
            Marks mark = marksRepository.findByStudent_IdAndSubject_Id(student.getStudentId(), subject.getId())
                    .orElse(new Marks());

            mark.setStudent(student);
            mark.setSubject(subject);

            if (dto.getCat1() != null) mark.setCat1Score(dto.getCat1());
            if (dto.getCat2() != null) mark.setCat2Score(dto.getCat2());
            if (dto.getCat3() != null) mark.setCat3Score(dto.getCat3());
            if (dto.getAssignment() != null) mark.setAssignmentScore(dto.getAssignment());
            if (dto.getSemesterGrade() != null && !dto.getSemesterGrade().isEmpty()) mark.setGrade(dto.getSemesterGrade());
            if (mark.getSemester() == null) mark.setSemester(1);

            calculationService.calculateAll(mark);
            marksToSave.add(mark);
            affectedStudentIds.add(student.getStudentId());
        }

        if (!marksToSave.isEmpty()) {
            marksRepository.saveAll(marksToSave);
            
            // Recalculate CGPA once per affected student (High Performance)
            for (Long sid : affectedStudentIds) {
                recalculateCgpa(sid);
            }

            auditService.log("BULK_MARKS_UPLOAD", 
                "Institutional scale processing: " + marksToSave.size() + " records synchronized successfully.");
            
            notificationService.sendBroadcast("Academic Update", 
                "Institutional result processing complete. Check your updated marksheets.");
        }
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
            historyRepository.save(com.university.erp.model.MarkHistory.builder()
                    .mark(mark)
                    .fieldName(field)
                    .oldValue(oldVal)
                    .newValue(newVal)
                    .changedBy("SYSTEM")
                    .build());
        }
    }

    public List<Marks> getStudentMarks(Long studentId) {
        return marksRepository.findByStudent_Id(studentId);
    }

    public java.util.List<Marks> getStudentMarksPaged(Long studentId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return marksRepository.findByStudent_Id(studentId, pageable).getContent();
    }

    @Transactional
    public void recalculateCgpa(Long studentId) {
        List<Marks> allMarks = marksRepository.findByStudent_Id(studentId);
        if (allMarks.isEmpty())
            return;

        BigDecimal totalGradePoints = BigDecimal.ZERO;
        int totalCredits = 0;

        for (Marks m : allMarks) {
            int gradePoint = convertToGradePoint(m.getGrade());
            int credits = m.getSubject().getCredits();
            totalGradePoints = totalGradePoints.add(BigDecimal.valueOf(gradePoint * credits));
            totalCredits += credits;
        }

        BigDecimal cgpa = totalGradePoints.divide(BigDecimal.valueOf(totalCredits), 2, RoundingMode.HALF_UP);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));
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
