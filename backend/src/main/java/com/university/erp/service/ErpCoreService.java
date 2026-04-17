package com.university.erp.service;

import com.university.erp.model.*;
import com.university.erp.util.ErpException;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ErpCoreService {
    private static final String APPROVAL_STATUS_PENDING = "PENDING";
    private static final String APPROVAL_STATUS_APPROVED = "APPROVED";
    private static final String APPROVAL_STATUS_REJECTED = "REJECTED";

    private final CurriculumRepository curriculumRepository;
    private final SemesterRepository semesterRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final UserRepository userRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final FacultySubjectRepository facultySubjectRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final InternalMarkRepository internalMarkRepository;
    private final GradeRepository gradeRepository;
    private final StudentAcademicRepository studentAcademicRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public Curriculum upsertCurriculum(Map<String, Object> payload) {
        String department = text(payload.get("department"));
        Integer regulationYear = intVal(payload.get("regulationYear"));
        String batchRange = text(payload.get("batchRange"));
        if (department.isBlank() || regulationYear == null || batchRange.isBlank()) {
            throw new ErpException.InvalidOperationException("department, regulationYear, batchRange are required");
        }
        Curriculum c = curriculumRepository.findByDepartmentAndRegulationYearAndBatchRange(department, regulationYear, batchRange)
                .orElseGet(Curriculum::new);
        c.setDepartment(department);
        c.setRegulationYear(regulationYear);
        c.setBatchRange(batchRange);
        c.setStatus(text(payload.get("status")).isBlank() ? "active" : text(payload.get("status")).toLowerCase());
        return curriculumRepository.save(c);
    }

    @Transactional(readOnly = true)
    public List<Curriculum> listCurricula() {
        return curriculumRepository.findAll();
    }

    @Transactional
    public FacultySubject assignFacultySubject(Map<String, Object> payload, Long approverUserId) {
        Long facultyUserId = longVal(payload.get("facultyUserId"));
        Long subjectId = longVal(payload.get("subjectId"));
        Integer semesterNo = intVal(payload.get("semester"));
        String section = text(payload.get("section"));
        if (facultyUserId == null || subjectId == null || semesterNo == null || section.isBlank()) {
            throw new ErpException.InvalidOperationException("facultyUserId, subjectId, semester, section are required");
        }
        FacultyProfile faculty = facultyProfileRepository.findByUser_Id(facultyUserId)
                .orElseGet(() -> {
                    User u = userRepository.findById(facultyUserId)
                            .orElseThrow(() -> new ErpException.ResourceNotFoundException("Faculty user not found"));
                    if (u.getRole() == null || u.getRole().getRoleName() != Role.UserRole.FACULTY) {
                        throw new ErpException.InvalidOperationException("User is not faculty");
                    }
                    return facultyProfileRepository.save(FacultyProfile.builder()
                            .user(u)
                            .employeeCode("FAC-" + u.getUserId())
                            .department(u.getDepartment() != null ? u.getDepartment().getCode() : "")
                            .status("active")
                            .build());
                });

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Subject not found"));
        Semester semester = semesterRepository.findBySemesterNumber(semesterNo)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Semester not found"));
        FacultySubject fs = FacultySubject.builder()
                .faculty(faculty)
                .subject(subject)
                .semester(semester)
                .section(section)
                .approvalStatus(APPROVAL_STATUS_APPROVED)
                .approvedBy(userRepository.findById(approverUserId).orElse(null))
                .approvedAt(LocalDateTime.now())
                .build();
        return facultySubjectRepository.save(fs);
    }

    @Transactional
    public FacultySubject submitFacultySubjectPreference(Map<String, Object> payload, Long facultyUserId) {
        Long subjectId = longVal(payload.get("subjectId"));
        Integer semesterNo = intVal(payload.get("semester"));
        String section = text(payload.get("section"));
        if (subjectId == null || semesterNo == null || section.isBlank()) {
            throw new ErpException.InvalidOperationException("subjectId, semester, section are required");
        }
        FacultyProfile faculty = facultyProfileRepository.findByUser_Id(facultyUserId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Faculty profile not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Subject not found"));
        Semester semester = semesterRepository.findBySemesterNumber(semesterNo)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Semester not found"));
        User requester = userRepository.findById(facultyUserId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Faculty user not found"));

        FacultySubject fs = FacultySubject.builder()
                .faculty(faculty)
                .subject(subject)
                .semester(semester)
                .section(section)
                .approvalStatus(APPROVAL_STATUS_PENDING)
                .requestedBy(requester)
                .build();
        return facultySubjectRepository.save(fs);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingFacultySubjectPreferences(Long departmentId) {
        List<FacultySubject> pending = departmentId == null
                ? facultySubjectRepository.findByApprovalStatusIgnoreCase(APPROVAL_STATUS_PENDING)
                : facultySubjectRepository.findByApprovalStatusIgnoreCaseAndSubject_Department_Id(APPROVAL_STATUS_PENDING, departmentId);
        return pending.stream().map(fs -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("facultySubjectId", fs.getFacultySubjectId());
            row.put("facultyUserId", fs.getFaculty() != null && fs.getFaculty().getUser() != null ? fs.getFaculty().getUser().getId() : null);
            row.put("facultyName", fs.getFaculty() != null && fs.getFaculty().getUser() != null
                    ? (text(fs.getFaculty().getUser().getFirstName()) + " " + text(fs.getFaculty().getUser().getLastName())).trim()
                    : "");
            row.put("subjectId", fs.getSubject() != null ? fs.getSubject().getId() : null);
            row.put("subjectCode", fs.getSubject() != null ? fs.getSubject().getSubjectCode() : null);
            row.put("subjectName", fs.getSubject() != null ? fs.getSubject().getSubjectName() : null);
            row.put("section", fs.getSection());
            row.put("semester", fs.getSemester() != null ? fs.getSemester().getSemesterNumber() : null);
            row.put("approvalStatus", fs.getApprovalStatus());
            row.put("requestedBy", fs.getRequestedBy() != null ? fs.getRequestedBy().getUsername() : null);
            return row;
        }).toList();
    }

    @Transactional
    public FacultySubject reviewFacultySubjectPreference(Long facultySubjectId, boolean approved, Long reviewerUserId) {
        FacultySubject fs = facultySubjectRepository.findById(facultySubjectId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Faculty-subject preference not found"));
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Reviewer user not found"));
        fs.setApprovalStatus(approved ? APPROVAL_STATUS_APPROVED : APPROVAL_STATUS_REJECTED);
        fs.setApprovedBy(reviewer);
        fs.setApprovedAt(LocalDateTime.now());
        return facultySubjectRepository.save(fs);
    }

    @Transactional
    public Map<String, Object> assignSubjectsToStudent(Long studentId, Integer semesterNo) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));
        int sem = semesterNo != null ? semesterNo : Optional.ofNullable(student.getCurrentSemester()).orElse(1);
        String dept = student.getDepartment() != null ? student.getDepartment().getDeptName() : "B.E. CSE";
        List<Subject> subjects = subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(sem, dept);
        if (subjects.isEmpty()) {
            // Fallback for historical datasets where department naming differs from subject.department_name.
            subjects = subjectRepository.findBySemester_SemesterNumberOrderBySubjectCodeAsc(sem);
        }
        Semester semester = semesterRepository.findBySemesterNumber(sem)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Semester not found"));
        int assigned = 0;
        for (Subject s : subjects) {
            if (studentSubjectRepository.findByStudent_IdAndSubject_IdAndSemester_SemesterId(studentId, s.getId(), semester.getSemesterId()).isPresent()) {
                continue;
            }
            studentSubjectRepository.save(StudentSubject.builder()
                    .student(student)
                    .subject(s)
                    .semester(semester)
                    .status("active")
                    .build());
            assigned++;
        }
        student.setCurrentSemester(sem);
        studentRepository.save(student);
        return Map.of("studentId", studentId, "semester", sem, "assignedSubjects", assigned);
    }

    @Transactional
    public Map<String, Object> promoteSection(String section) {
        List<Student> students = studentRepository.findBySectionIgnoreCase(section);
        int promoted = 0;
        for (Student s : students) {
            int nextSem = Optional.ofNullable(s.getCurrentSemester()).orElse(1) + 1;
            if (nextSem > 8) continue;
            s.setCurrentSemester(nextSem);
            if (nextSem % 2 == 1) {
                s.setYear(Math.min(4, Optional.ofNullable(s.getYear()).orElse(1) + 1));
            }
            studentRepository.save(s);
            assignSubjectsToStudent(s.getId(), nextSem);
            promoted++;
        }
        return Map.of("section", section, "promotedStudents", promoted);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> facultyAssignments(Long facultyUserId) {
        return facultySubjectRepository.findByFaculty_User_Id(facultyUserId).stream()
                .map(fs -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("facultySubjectId", fs.getFacultySubjectId());
                    row.put("subjectId", fs.getSubject().getId());
                    row.put("subjectCode", fs.getSubject().getSubjectCode());
                    row.put("subjectName", fs.getSubject().getSubjectName());
                    row.put("section", fs.getSection());
                    row.put("semester", fs.getSemester().getSemesterNumber());
                    return row;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> facultyRoster(Long facultyUserId, Long subjectId, Integer semester, String section) {
        boolean assigned = !facultySubjectRepository.findBySubject_IdAndSemester_SemesterNumberAndSectionIgnoreCase(subjectId, semester, section)
                .stream().filter(fs -> Objects.equals(fs.getFaculty().getUser().getId(), facultyUserId)).toList().isEmpty();
        if (!assigned) throw new AccessDeniedException("Faculty not assigned");

        List<StudentSubject> roster = studentSubjectRepository
                .findByStudent_SectionIgnoreCaseAndSubject_IdAndSemester_SemesterNumber(section, subjectId, semester);
        List<Map<String, Object>> out = new ArrayList<>();
        for (StudentSubject ss : roster) {
            List<AttendanceRecord> records = attendanceRecordRepository.findByStudentSubject_Student_Id(ss.getStudent().getId())
                    .stream().filter(r -> Objects.equals(r.getStudentSubject().getSubject().getId(), subjectId)).toList();
            long total = records.size();
            long present = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getStatus())).count();
            double pct = total == 0 ? 0 : present * 100.0 / total;
            out.add(Map.of(
                    "studentSubjectId", ss.getStudentSubjectId(),
                    "studentId", ss.getStudent().getId(),
                    "registerNo", Optional.ofNullable(ss.getStudent().getRegisterNo()).orElse(ss.getStudent().getStudentIdNumber()),
                    "name", Optional.ofNullable(ss.getStudent().getStudentName()).orElse("Student"),
                    "attended", present,
                    "total", total,
                    "percentage", BigDecimal.valueOf(pct).setScale(1, RoundingMode.HALF_UP)
            ));
        }
        return out;
    }

    @Transactional
    public Map<String, Object> submitAttendance(Long facultyUserId, Map<String, Object> payload) {
        Long subjectId = longVal(payload.get("subjectId"));
        Integer semesterNo = intVal(payload.get("semester"));
        String section = text(payload.get("section"));
        LocalDate date = payload.get("date") == null ? LocalDate.now() : LocalDate.parse(String.valueOf(payload.get("date")));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> records = (List<Map<String, Object>>) payload.getOrDefault("records", List.of());

        boolean assigned = !facultySubjectRepository.findBySubject_IdAndSemester_SemesterNumberAndSectionIgnoreCase(subjectId, semesterNo, section)
                .stream().filter(fs -> Objects.equals(fs.getFaculty().getUser().getId(), facultyUserId)).toList().isEmpty();
        if (!assigned) {
            throw new AccessDeniedException("Faculty not assigned to this subject/section/semester");
        }
        User facultyUser = userRepository.findById(facultyUserId).orElseThrow();
        int upserted = 0;
        for (Map<String, Object> row : records) {
            Long studentId = longVal(row.get("studentId"));
            String status = text(row.get("status")).equalsIgnoreCase("absent") ? "Absent" : "Present";
            StudentSubject ss = studentSubjectRepository.findByStudent_IdAndSubject_IdAndSemester_SemesterId(
                    studentId, subjectId, semesterRepository.findBySemesterNumber(semesterNo).orElseThrow().getSemesterId())
                    .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student subject assignment missing"));
            AttendanceRecord ar = attendanceRecordRepository.findByStudentSubject_StudentSubjectIdAndDate(ss.getStudentSubjectId(), date)
                    .orElseGet(AttendanceRecord::new);
            ar.setStudentSubject(ss);
            ar.setDate(date);
            ar.setStatus(status);
            ar.setRecordedBy(facultyUser);
            attendanceRecordRepository.save(ar);
            upserted++;
        }
        return Map.of("date", date, "recordsUpserted", upserted);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> attendanceSummaryForStudent(Long userId) {
        Student s = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));
        Map<Long, List<AttendanceRecord>> bySubject = new LinkedHashMap<>();
        for (AttendanceRecord ar : attendanceRecordRepository.findByStudentSubject_Student_Id(s.getId())) {
            bySubject.computeIfAbsent(ar.getStudentSubject().getSubject().getId(), k -> new ArrayList<>()).add(ar);
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (List<AttendanceRecord> list : bySubject.values()) {
            if (list.isEmpty()) continue;
            Subject sub = list.get(0).getStudentSubject().getSubject();
            long present = list.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
            long total = list.size();
            double pct = total == 0 ? 0 : (present * 100.0 / total);
            out.add(Map.of(
                    "subjectCode", sub.getSubjectCode(),
                    "subjectName", sub.getSubjectName(),
                    "present", present,
                    "total", total,
                    "percentage", BigDecimal.valueOf(pct).setScale(1, RoundingMode.HALF_UP)
            ));
        }
        return out;
    }

    @Transactional
    public Map<String, Object> upsertInternalMark(Long facultyUserId, Map<String, Object> payload) {
        Long studentSubjectId = longVal(payload.get("studentSubjectId"));
        StudentSubject ss = studentSubjectRepository.findById(studentSubjectId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("studentSubject not found"));
        boolean assigned = !facultySubjectRepository.findBySubject_IdAndSemester_SemesterNumberAndSectionIgnoreCase(
                ss.getSubject().getId(), ss.getSemester().getSemesterNumber(), ss.getStudent().getSection())
                .stream().filter(fs -> Objects.equals(fs.getFaculty().getUser().getId(), facultyUserId)).toList().isEmpty();
        if (!assigned) throw new AccessDeniedException("Faculty not assigned");

        BigDecimal cat1 = bd(payload.get("cat1Marks"));
        BigDecimal cat2 = bd(payload.get("cat2Marks"));
        BigDecimal cat3 = bd(payload.get("cat3Marks"));
        BigDecimal assignment = bd(payload.get("assignmentMarks"));
        BigDecimal attendanceMarks = computeAttendanceMarks(ss.getStudent().getUser().getId(), ss.getSubject().getId());
        BigDecimal totalInternal = computeTotalInternal(cat1, cat2, cat3, assignment, attendanceMarks);

        InternalMark im = internalMarkRepository.findByStudentSubject_StudentSubjectId(studentSubjectId).orElseGet(InternalMark::new);
        im.setStudentSubject(ss);
        im.setCat1Marks(cat1);
        im.setCat2Marks(cat2);
        im.setCat3Marks(cat3);
        im.setAssignmentMarks(assignment);
        im.setAttendanceMarks(attendanceMarks);
        im.setTotalInternal(totalInternal);
        im.setUpdatedBy(userRepository.findById(facultyUserId).orElseThrow());
        internalMarkRepository.save(im);
        return Map.of("studentSubjectId", studentSubjectId, "totalInternal", totalInternal);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> internalMarksForStudent(Long userId) {
        Student s = studentRepository.findByUser_Id(userId).orElseThrow();
        return internalMarkRepository.findByStudentSubject_Student_Id(s.getId()).stream()
                .map(im -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("studentSubjectId", im.getStudentSubject().getStudentSubjectId());
                    row.put("subjectCode", im.getStudentSubject().getSubject().getSubjectCode());
                    row.put("subjectName", im.getStudentSubject().getSubject().getSubjectName());
                    row.put("cat1Marks", nz(im.getCat1Marks()));
                    row.put("cat2Marks", nz(im.getCat2Marks()));
                    row.put("cat3Marks", nz(im.getCat3Marks()));
                    row.put("assignmentMarks", nz(im.getAssignmentMarks()));
                    row.put("attendanceMarks", nz(im.getAttendanceMarks()));
                    row.put("totalInternal", nz(im.getTotalInternal()));
                    return row;
                }).toList();
    }

    @Transactional
    public Map<String, Object> publishGrade(Map<String, Object> payload) {
        Long studentSubjectId = longVal(payload.get("studentSubjectId"));
        BigDecimal external = bd(payload.get("externalMarks"));
        StudentSubject ss = studentSubjectRepository.findById(studentSubjectId).orElseThrow();
        InternalMark im = internalMarkRepository.findByStudentSubject_StudentSubjectId(studentSubjectId).orElseThrow(
                () -> new ErpException.ResourceNotFoundException("Internal marks missing"));
        BigDecimal internal = nz(im.getTotalInternal());
        BigDecimal total = internal.add(external).setScale(2, RoundingMode.HALF_UP);
        GradeScale scale = toGrade(total.doubleValue());
        if (!gradeRepository.existsByStudent_IdAndSubject_IdAndSemester_SemesterId(ss.getStudent().getId(), ss.getSubject().getId(), ss.getSemester().getSemesterId())) {
            gradeRepository.save(Grade.builder()
                    .student(ss.getStudent())
                    .subject(ss.getSubject())
                    .semester(ss.getSemester())
                    .internalMarks(internal)
                    .externalMarks(external)
                    .totalMarks(total)
                    .gradeLetter(scale.letter)
                    .gradePoints(BigDecimal.valueOf(scale.points))
                    .build());
        }
        recalcGpaCgpa(ss.getStudent().getId());
        Notification n = Notification.builder()
                .recipient(ss.getStudent().getUser())
                .content("New grade published for " + ss.getSubject().getSubjectCode())
                .type("ACADEMIC")
                .isRead(false)
                .build();
        notificationRepository.save(n);
        return Map.of("studentSubjectId", studentSubjectId, "totalMarks", total, "grade", scale.letter, "gradePoints", scale.points);
    }

    @Transactional(readOnly = true)
    public List<Subject> currentSubjects(Long userId) {
        Student s = studentRepository.findByUser_Id(userId).orElseThrow();
        int sem = Optional.ofNullable(s.getCurrentSemester()).orElse(1);
        return studentSubjectRepository.findByStudent_IdAndSemester_SemesterNumberAndStatusIgnoreCase(s.getId(), sem, "active")
                .stream().map(StudentSubject::getSubject).toList();
    }

    private void recalcGpaCgpa(Long studentId) {
        List<Grade> grades = gradeRepository.findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(studentId);
        Map<Integer, List<Grade>> bySem = new LinkedHashMap<>();
        for (Grade g : grades) bySem.computeIfAbsent(g.getSemester().getSemesterNumber(), k -> new ArrayList<>()).add(g);
        BigDecimal cumulative = BigDecimal.ZERO;
        int cumulativeCredits = 0;
        for (Map.Entry<Integer, List<Grade>> e : bySem.entrySet()) {
            BigDecimal semWeighted = BigDecimal.ZERO;
            int semCredits = 0;
            for (Grade g : e.getValue()) {
                int c = Optional.ofNullable(g.getSubject().getCredits()).orElse(0);
                semWeighted = semWeighted.add(g.getGradePoints().multiply(BigDecimal.valueOf(c)));
                semCredits += c;
            }
            BigDecimal gpa = semCredits == 0 ? BigDecimal.ZERO : semWeighted.divide(BigDecimal.valueOf(semCredits), 2, RoundingMode.HALF_UP);
            cumulative = cumulative.add(semWeighted);
            cumulativeCredits += semCredits;
            BigDecimal cgpa = cumulativeCredits == 0 ? BigDecimal.ZERO : cumulative.divide(BigDecimal.valueOf(cumulativeCredits), 2, RoundingMode.HALF_UP);
            StudentAcademic rec = studentAcademicRepository.findByStudent_IdAndSemester(studentId, e.getKey()).orElseGet(StudentAcademic::new);
            rec.setStudent(studentRepository.findById(studentId).orElseThrow());
            rec.setSemester(e.getKey());
            rec.setGpa(gpa);
            rec.setCgpa(cgpa);
            studentAcademicRepository.save(rec);
            Student st = rec.getStudent();
            st.setCurrentCgpa(cgpa);
            studentRepository.save(st);
        }
    }

    private BigDecimal computeAttendanceMarks(Long userId, Long subjectId) {
        List<Map<String, Object>> summary = attendanceSummaryForStudent(userId);
        double pct = summary.stream()
                .filter(m -> Objects.equals(m.get("subjectCode"), subjectRepository.findById(subjectId).map(Subject::getSubjectCode).orElse("")))
                .findFirst().map(m -> ((BigDecimal) m.get("percentage")).doubleValue()).orElse(0.0);
        if (pct >= 95) return BigDecimal.valueOf(5);
        if (pct >= 90) return BigDecimal.valueOf(4);
        if (pct >= 85) return BigDecimal.valueOf(3);
        if (pct >= 80) return BigDecimal.valueOf(2);
        if (pct >= 75) return BigDecimal.valueOf(1);
        return BigDecimal.ZERO;
    }

    private BigDecimal computeTotalInternal(BigDecimal c1, BigDecimal c2, BigDecimal c3, BigDecimal assign, BigDecimal attendance) {
        List<BigDecimal> cats = new ArrayList<>(List.of(nz(c1), nz(c2), nz(c3)));
        cats.sort(Comparator.reverseOrder());
        BigDecimal top2Avg = cats.get(0).add(cats.get(1)).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        BigDecimal catScaled = top2Avg.multiply(BigDecimal.valueOf(0.6)); // 30 max if CAT out of 50
        BigDecimal assignmentScaled = nz(assign).multiply(BigDecimal.valueOf(0.2)); // 10 max if assignment out of 50
        return catScaled.add(assignmentScaled).add(nz(attendance)).setScale(2, RoundingMode.HALF_UP); // total internal out of ~45
    }

    private record GradeScale(String letter, double points) {}
    private static GradeScale toGrade(double total) {
        if (total >= 90) return new GradeScale("O", 10.0);
        if (total >= 80) return new GradeScale("A+", 9.0);
        if (total >= 70) return new GradeScale("A", 8.0);
        if (total >= 60) return new GradeScale("B+", 7.0);
        if (total >= 50) return new GradeScale("B", 6.0);
        if (total >= 45) return new GradeScale("C", 5.0);
        return new GradeScale("RA", 0.0);
    }

    private static BigDecimal bd(Object o) {
        if (o == null) return BigDecimal.ZERO;
        try { return new BigDecimal(String.valueOf(o)).setScale(2, RoundingMode.HALF_UP); }
        catch (Exception e) { return BigDecimal.ZERO; }
    }
    private static BigDecimal nz(BigDecimal b) { return b == null ? BigDecimal.ZERO : b; }
    private static String text(Object o) { return o == null ? "" : String.valueOf(o).trim(); }
    private static Long longVal(Object o) { try { return o == null ? null : Long.valueOf(String.valueOf(o)); } catch (Exception e) { return null; } }
    private static Integer intVal(Object o) { try { return o == null ? null : Integer.valueOf(String.valueOf(o)); } catch (Exception e) { return null; } }
}
