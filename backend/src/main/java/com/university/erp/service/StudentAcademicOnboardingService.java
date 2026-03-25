package com.university.erp.service;

import com.university.erp.dto.CseAStudentImportDto;
import com.university.erp.entity.*;
import com.university.erp.exception.ErpException;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentAcademicOnboardingService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;
    private final SubjectRepository subjectRepository;
    private final GradeRepository gradeRepository;
    private final StudentAcademicRepository studentAcademicRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final FacultySubjectRepository facultySubjectRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String CSE_DEPARTMENT_NAME = "B.E. CSE";
    private static final String CSE_SECTION = "CSE-A";
    private static final String BATCH_2024_2028 = "2024-2028";

    @Transactional
    public Map<String, Object> importCseAStudents(List<CseAStudentImportDto> rows) {
        if (rows == null || rows.isEmpty()) {
            throw new ErpException.InvalidOperationException("Import payload is empty");
        }

        Department cse = departmentRepository.findByCode("CSE")
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .code("CSE")
                        .deptName(CSE_DEPARTMENT_NAME)
                        .build()));
        Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("STUDENT role not found"));

        seedCurriculum(cse);

        int createdStudents = 0;
        int updatedStudents = 0;
        int createdUsers = 0;

        for (CseAStudentImportDto row : rows) {
            String registerNo = normalize(row.getRegisterNo());
            String name = normalize(row.getName());
            if (registerNo.isBlank() || name.isBlank()) continue;

            Student student = studentRepository.findByRegisterNo(registerNo)
                    .or(() -> studentRepository.findByStudentIdNumber(registerNo))
                    .orElseGet(Student::new);

            boolean isNewStudent = student.getId() == null;
            student.setRegisterNo(registerNo);
            student.setStudentIdNumber(registerNo);
            student.setStudentName(name);
            student.setSection(CSE_SECTION);
            student.setBatch(BATCH_2024_2028);
            student.setScholarType(normalize(row.getScholarType()).isBlank() ? "Day Scholar" : normalize(row.getScholarType()));
            student.setEmail(normalize(row.getEmail()));
            student.setPhone(normalize(row.getPhone()));
            student.setStatus("active");
            student.setYear(1);
            student.setDepartment(cse);

            User user = student.getUser();
            if (user == null) {
                user = userRepository.findByUsername(registerNo).orElseGet(User::new);
            }

            boolean isNewUser = user.getUserId() == null;
            String[] names = splitName(name);
            user.setUsername(registerNo);
            user.setEmail(!normalize(row.getEmail()).isBlank() ? normalize(row.getEmail()) : registerNo.toLowerCase() + "@ritchennai.edu.in");
            user.setFirstName(names[0]);
            user.setLastName(names[1]);
            user.setRole(studentRole);
            user.setDepartment(cse);
            user.setAccountStatus("active");
            user.setMustChangePassword(true);
            if (isNewUser) {
                user.setPassword(passwordEncoder.encode(registerNo)); // first login credential
            }
            user = userRepository.save(user);

            student.setUser(user);
            student = studentRepository.save(student);

            user.setLinkedStudent(student);
            userRepository.save(user);

            generateMockGradesAndAcademics(student);

            if (isNewStudent) createdStudents++; else updatedStudents++;
            if (isNewUser) createdUsers++;
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("createdStudents", createdStudents);
        resp.put("updatedStudents", updatedStudents);
        resp.put("createdUsers", createdUsers);
        resp.put("totalImportedRows", rows.size());
        resp.put("section", CSE_SECTION);
        resp.put("batch", BATCH_2024_2028);
        return resp;
    }

    @Transactional
    public void resetStudentPassword(Long studentId) {
        User user = userRepository.findByLinkedStudent_Id(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student user account not found"));
        String registerNo = user.getLinkedStudent() != null ? user.getLinkedStudent().getRegisterNo() : user.getUsername();
        user.setPassword(passwordEncoder.encode(registerNo));
        user.setMustChangePassword(true);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listStudentsBySection(String section) {
        String sectionValue = normalize(section).isBlank() ? CSE_SECTION : normalize(section);
        return studentRepository.findBySectionIgnoreCase(sectionValue)
                .stream()
                .map(this::toStudentAdminCard)
                .toList();
    }

    @Transactional
    public Map<String, Object> updateStudent(Long studentId, Map<String, Object> payload) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));
        String name = normalize(payload.get("name"));
        if (!name.isBlank()) {
            student.setStudentName(name);
            String[] split = splitName(name);
            if (student.getUser() != null) {
                student.getUser().setFirstName(split[0]);
                student.getUser().setLastName(split[1]);
                userRepository.save(student.getUser());
            }
        }
        String scholarType = normalize(payload.get("scholarType"));
        if (!scholarType.isBlank()) student.setScholarType(scholarType);
        String phone = normalize(payload.get("phone"));
        if (!phone.isBlank()) student.setPhone(phone);
        String email = normalize(payload.get("email"));
        if (!email.isBlank()) {
            student.setEmail(email);
            if (student.getUser() != null) {
                student.getUser().setEmail(email);
                userRepository.save(student.getUser());
            }
        }
        String status = normalize(payload.get("status"));
        if (!status.isBlank()) {
            student.setStatus(status.toLowerCase());
            if (student.getUser() != null) {
                student.getUser().setAccountStatus(status.toLowerCase());
                userRepository.save(student.getUser());
            }
        }
        return toStudentAdminCard(studentRepository.save(student));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDashboardData(Long userId) {
        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("profile", toStudentProfile(student));
        resp.put("academics", studentAcademicRepository.findByStudent_IdOrderBySemesterAsc(student.getId())
                .stream()
                .map(sa -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("semester", sa.getSemester());
                    row.put("gpa", sa.getGpa());
                    row.put("cgpa", sa.getCgpa());
                    return row;
                })
                .toList());
        resp.put("gradebook", gradeRepository.findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(student.getId())
                .stream().map(this::toGradeCard).toList());
        resp.put("subjects", subjectRepository.findByDepartmentId(student.getDepartment().getId())
                .stream().map(s -> Map.of(
                        "subjectCode", s.getSubjectCode(),
                        "subjectName", s.getSubjectName(),
                        "credits", s.getCredits(),
                        "semester", s.getSemester() != null ? s.getSemester().getSemesterNumber() : null
                )).toList());
        resp.put("notifications", List.of("Welcome to Smart Campus", "Check updated gradebook records"));
        return resp;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getGradebook(Long userId, Integer semester) {
        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));
        List<Grade> grades = semester == null
                ? gradeRepository.findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(student.getId())
                : gradeRepository.findByStudent_IdAndSemester_SemesterNumberOrderBySubject_SubjectCodeAsc(student.getId(), semester);
        return grades.stream().map(this::toGradeCard).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSemGpa(Long userId) {
        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));
        return studentAcademicRepository.findByStudent_IdOrderBySemesterAsc(student.getId()).stream()
                .map(sa -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("semester", sa.getSemester());
                    map.put("gpa", sa.getGpa());
                    map.put("cgpa", sa.getCgpa());
                    return map;
                }).toList();
    }

    @Transactional
    public Map<String, Object> repairDemoAcademicLinks() {
        int linkedStudents = 0;
        int linkedParents = 0;
        int relinkedStudentUsers = 0;
        int createdFacultyProfiles = 0;
        int createdFacultySubjects = 0;

        Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT).orElse(null);
        Role parentRole = roleRepository.findByRoleName(Role.UserRole.PARENT).orElse(null);

        List<User> users = userRepository.findAll();
        for (Student st : studentRepository.findBySectionIgnoreCase(CSE_SECTION)) {
            User byUsername = normalize(st.getRegisterNo()).isBlank() ? null : userRepository.findByUsername(st.getRegisterNo()).orElse(null);
            User byEmail = normalize(st.getEmail()).isBlank() ? null : userRepository.findByEmail(st.getEmail()).orElse(null);
            User target = byUsername != null ? byUsername : byEmail;
            if (target != null && (st.getUser() == null || !Objects.equals(st.getUser().getId(), target.getId()))) {
                st.setUser(target);
                studentRepository.save(st);
                relinkedStudentUsers++;
            }
        }
        for (User u : users) {
            if (u.getRole() == null || u.getRole().getRoleName() == null) continue;
            if (studentRole != null && u.getRole().getRoleId().equals(studentRole.getRoleId())) {
                if (u.getLinkedStudent() == null) {
                    Student st = studentRepository.findByUser_Id(u.getId()).orElse(null);
                    if (st != null) {
                        u.setLinkedStudent(st);
                        userRepository.save(u);
                        linkedStudents++;
                    }
                }
            }
        }

        Student defaultWard = studentRepository.findBySectionIgnoreCase(CSE_SECTION).stream().findFirst().orElse(null);
        if (parentRole != null && defaultWard != null) {
            for (User u : users) {
                if (u.getRole() != null && u.getRole().getRoleId().equals(parentRole.getRoleId()) && u.getLinkedStudent() == null) {
                    u.setLinkedStudent(defaultWard);
                    userRepository.save(u);
                    linkedParents++;
                }
            }
        }

        List<User> facultyUsers = users.stream()
                .filter(u -> u.getRole() != null && u.getRole().getRoleName() == Role.UserRole.FACULTY)
                .toList();
        for (User fu : facultyUsers) {
            if (facultyProfileRepository.findByUser_Id(fu.getId()).isEmpty()) {
                FacultyProfile fp = FacultyProfile.builder()
                        .user(fu)
                        .employeeCode("FAC-" + fu.getId())
                        .department(fu.getDepartment() != null ? fu.getDepartment().getCode() : "CSE")
                        .status("active")
                        .build();
                facultyProfileRepository.save(fp);
                createdFacultyProfiles++;
            }
        }

        List<StudentSubject> allStudentSubjects = studentSubjectRepository.findAll();
        List<FacultyProfile> facultyProfiles = facultyProfileRepository.findAll();
        if (!facultyProfiles.isEmpty()) {
            for (StudentSubject ss : allStudentSubjects) {
                FacultyProfile fp = facultyProfiles.get(Math.abs(Objects.requireNonNullElse(ss.getSubject().getSubjectCode(), "X").hashCode()) % facultyProfiles.size());
                boolean exists = !facultySubjectRepository
                        .findBySubject_IdAndSemester_SemesterNumberAndSectionIgnoreCase(
                                ss.getSubject().getId(),
                                ss.getSemester().getSemesterNumber(),
                                Optional.ofNullable(ss.getStudent().getSection()).orElse(CSE_SECTION))
                        .stream()
                        .filter(x -> Objects.equals(x.getFaculty().getFacultyId(), fp.getFacultyId()))
                        .toList()
                        .isEmpty();
                if (!exists) {
                    FacultySubject fs = FacultySubject.builder()
                            .faculty(fp)
                            .subject(ss.getSubject())
                            .semester(ss.getSemester())
                            .section(Optional.ofNullable(ss.getStudent().getSection()).orElse(CSE_SECTION))
                            .build();
                    facultySubjectRepository.save(fs);
                    createdFacultySubjects++;
                }
            }
        }

        return Map.of(
                "linkedStudents", linkedStudents,
                "linkedParents", linkedParents,
                "relinkedStudentUsers", relinkedStudentUsers,
                "createdFacultyProfiles", createdFacultyProfiles,
                "createdFacultySubjects", createdFacultySubjects
        );
    }

    private void seedCurriculum(Department cse) {
        Semester sem1 = semesterRepository.findBySemesterNumber(1)
                .orElseGet(() -> semesterRepository.save(Semester.builder().semesterNumber(1).build()));
        Semester sem2 = semesterRepository.findBySemesterNumber(2)
                .orElseGet(() -> semesterRepository.save(Semester.builder().semesterNumber(2).build()));

        seedSubject("MA1101", "Mathematics I", 4, sem1, cse);
        seedSubject("PH1101", "Physics", 3, sem1, cse);
        seedSubject("CS1101", "Programming in C", 3, sem1, cse);
        seedSubject("GE1101", "Engineering Graphics", 4, sem1, cse);
        seedSubject("HS1101", "English", 2, sem1, cse);
        seedSubject("PH1111", "Physics Lab", 1, sem1, cse);
        seedSubject("CS1111", "Programming Lab", 1, sem1, cse);

        seedSubject("MA1201", "Mathematics II", 4, sem2, cse);
        seedSubject("CY1201", "Chemistry", 3, sem2, cse);
        seedSubject("CS1201", "Data Structures", 4, sem2, cse);
        seedSubject("EC1201", "Digital Logic", 3, sem2, cse);
        seedSubject("GE1201", "Environmental Science", 2, sem2, cse);
        seedSubject("CY1211", "Chemistry Lab", 1, sem2, cse);
        seedSubject("CS1211", "DS Lab", 1, sem2, cse);
    }

    private void seedSubject(String code, String name, int credits, Semester semester, Department cse) {
        Subject subject = subjectRepository.findBySubjectCode(code).orElseGet(Subject::new);
        subject.setSubjectCode(code);
        subject.setSubjectName(name);
        subject.setCredits(credits);
        subject.setDepartment(cse);
        subject.setDepartmentName(CSE_DEPARTMENT_NAME);
        subject.setSemester(semester);
        subject.setRegulation("R2024");
        subjectRepository.save(subject);
    }

    private void generateMockGradesAndAcademics(Student student) {
        if (student.getDepartment() == null) return;
        List<Subject> sem1Subjects = subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(1, CSE_DEPARTMENT_NAME);
        List<Subject> sem2Subjects = subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(2, CSE_DEPARTMENT_NAME);
        Semester sem1 = semesterRepository.findBySemesterNumber(1).orElseThrow();
        Semester sem2 = semesterRepository.findBySemesterNumber(2).orElseThrow();

        double profileFactor = performanceFactor(student.getRegisterNo() != null ? student.getRegisterNo() : student.getStudentIdNumber());

        createGradesForSemester(student, sem1, sem1Subjects, profileFactor);
        createGradesForSemester(student, sem2, sem2Subjects, profileFactor - 0.2);
        recalcStudentAcademic(student);
    }

    private void createGradesForSemester(Student student, Semester semester, List<Subject> subjects, double factor) {
        Random random = new Random((student.getRegisterNo() + "-" + semester.getSemesterNumber()).hashCode());
        for (Subject subject : subjects) {
            if (gradeRepository.existsByStudent_IdAndSubject_IdAndSemester_SemesterId(student.getId(), subject.getId(), semester.getSemesterId())) {
                continue;
            }
            double internalBase = 28 + (factor * 6) + (random.nextDouble() * 6);
            double externalBase = 40 + (factor * 12) + (random.nextDouble() * 18);
            BigDecimal internal = bd(internalBase, 50);
            BigDecimal external = bd(externalBase, 100);
            BigDecimal total = internal.add(external).setScale(2, RoundingMode.HALF_UP);
            GradeScale gradeScale = toGrade(total.doubleValue());

            gradeRepository.save(Grade.builder()
                    .student(student)
                    .subject(subject)
                    .semester(semester)
                    .internalMarks(internal)
                    .externalMarks(external)
                    .totalMarks(total)
                    .gradeLetter(gradeScale.letter)
                    .gradePoints(BigDecimal.valueOf(gradeScale.points).setScale(2, RoundingMode.HALF_UP))
                    .build());
        }
    }

    private void recalcStudentAcademic(Student student) {
        List<Grade> all = gradeRepository.findByStudent_IdOrderBySemester_SemesterNumberAscSubject_SubjectCodeAsc(student.getId());
        Map<Integer, List<Grade>> bySemester = new LinkedHashMap<>();
        for (Grade g : all) {
            bySemester.computeIfAbsent(g.getSemester().getSemesterNumber(), k -> new ArrayList<>()).add(g);
        }

        BigDecimal cumulativeWeighted = BigDecimal.ZERO;
        int cumulativeCredits = 0;
        BigDecimal latestCgpa = BigDecimal.ZERO;

        for (Map.Entry<Integer, List<Grade>> entry : bySemester.entrySet()) {
            int semNo = entry.getKey();
            List<Grade> grades = entry.getValue();
            BigDecimal weighted = BigDecimal.ZERO;
            int credits = 0;
            for (Grade g : grades) {
                int c = Optional.ofNullable(g.getSubject().getCredits()).orElse(0);
                weighted = weighted.add(g.getGradePoints().multiply(BigDecimal.valueOf(c)));
                credits += c;
            }
            BigDecimal semGpa = credits == 0 ? BigDecimal.ZERO : weighted.divide(BigDecimal.valueOf(credits), 2, RoundingMode.HALF_UP);
            cumulativeWeighted = cumulativeWeighted.add(weighted);
            cumulativeCredits += credits;
            latestCgpa = cumulativeCredits == 0 ? BigDecimal.ZERO : cumulativeWeighted.divide(BigDecimal.valueOf(cumulativeCredits), 2, RoundingMode.HALF_UP);

            StudentAcademic sa = studentAcademicRepository.findByStudent_IdAndSemester(student.getId(), semNo)
                    .orElseGet(StudentAcademic::new);
            sa.setStudent(student);
            sa.setSemester(semNo);
            sa.setGpa(semGpa);
            sa.setCgpa(latestCgpa);
            studentAcademicRepository.save(sa);
        }

        student.setCurrentCgpa(latestCgpa);
        studentRepository.save(student);
    }

    private Map<String, Object> toStudentAdminCard(Student s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("studentId", s.getId());
        map.put("registerNo", Optional.ofNullable(s.getRegisterNo()).orElse(s.getStudentIdNumber()));
        map.put("name", Optional.ofNullable(s.getStudentName()).orElseGet(() -> fullName(s.getUser())));
        map.put("department", s.getDepartment() != null ? s.getDepartment().getDeptName() : CSE_DEPARTMENT_NAME);
        map.put("section", s.getSection());
        map.put("batch", s.getBatch());
        map.put("scholarType", s.getScholarType());
        map.put("email", !normalize(s.getEmail()).isBlank() ? s.getEmail() : (s.getUser() != null ? s.getUser().getEmail() : ""));
        map.put("phone", s.getPhone());
        map.put("status", s.getStatus());
        map.put("cgpa", s.getCurrentCgpa());
        return map;
    }

    private Map<String, Object> toStudentProfile(Student s) {
        Map<String, Object> map = toStudentAdminCard(s);
        map.put("username", s.getUser() != null ? s.getUser().getUsername() : null);
        map.put("mustChangePassword", s.getUser() != null && s.getUser().isMustChangePassword());
        return map;
    }

    private Map<String, Object> toGradeCard(Grade g) {
        return Map.of(
                "gradeId", g.getGradeId(),
                "semester", g.getSemester().getSemesterNumber(),
                "subjectCode", g.getSubject().getSubjectCode(),
                "subjectName", g.getSubject().getSubjectName(),
                "credits", g.getSubject().getCredits(),
                "internalMarks", g.getInternalMarks(),
                "externalMarks", g.getExternalMarks(),
                "totalMarks", g.getTotalMarks(),
                "gradeLetter", g.getGradeLetter(),
                "gradePoints", g.getGradePoints());
    }

    private static String[] splitName(String fullName) {
        String name = normalize(fullName);
        if (name.isBlank()) return new String[] { "Student", "" };
        String[] parts = name.split("\\s+", 2);
        return new String[] { parts[0], parts.length > 1 ? parts[1] : "" };
    }

    private static String fullName(User user) {
        if (user == null) return "";
        String first = Optional.ofNullable(user.getFirstName()).orElse("");
        String last = Optional.ofNullable(user.getLastName()).orElse("");
        return (first + " " + last).trim();
    }

    private static BigDecimal bd(double value, int max) {
        double bounded = Math.max(0, Math.min(value, max));
        return BigDecimal.valueOf(bounded).setScale(2, RoundingMode.HALF_UP);
    }

    private static double performanceFactor(String key) {
        int hash = Math.abs(Objects.requireNonNullElse(key, "x").hashCode());
        int bucket = hash % 10;
        if (bucket <= 2) return 2.8; // high performers
        if (bucket <= 7) return 1.8; // average
        return 0.9; // low
    }

    private static GradeScale toGrade(double total) {
        if (total >= 90) return new GradeScale("O", 10.0);
        if (total >= 80) return new GradeScale("A+", 9.0);
        if (total >= 70) return new GradeScale("A", 8.0);
        if (total >= 60) return new GradeScale("B+", 7.0);
        if (total >= 50) return new GradeScale("B", 6.0);
        if (total >= 45) return new GradeScale("C", 5.0);
        return new GradeScale("RA", 0.0);
    }

    private static String normalize(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private record GradeScale(String letter, double points) {}
}
