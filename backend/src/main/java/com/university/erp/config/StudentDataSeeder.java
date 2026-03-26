package com.university.erp.config;

import com.university.erp.entity.*;
import com.university.erp.repository.*;
import com.university.erp.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@org.springframework.context.annotation.Lazy
@Slf4j
public class StudentDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final GradeRepository gradeRepository;
    private final StudentAcademicRepository studentAcademicRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentSubjectRepository studentSubjectRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private ParentRepository parentRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private FacultySubjectRepository facultySubjectRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private FacultyProfileRepository facultyProfileRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private TransportRouteRepository transportRouteRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private StudentTransportRepository studentTransportRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private HostelRepository hostelRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private RoomRepository roomRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private CompanyRepository companyRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private PlacementOpportunityRepository opportunityRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private AttendanceAnalyticsService attendanceAnalyticsService;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private StudentSuccessService studentSuccessService;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private HostelService hostelService;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private BuildingRepository buildingRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private ClassroomRepository classroomRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private TimetableSlotRepository timetableSlotRepository;

    public StudentDataSeeder(
            @org.springframework.context.annotation.Lazy UserRepository userRepository,
            @org.springframework.context.annotation.Lazy StudentRepository studentRepository,
            @org.springframework.context.annotation.Lazy RoleRepository roleRepository,
            @org.springframework.context.annotation.Lazy DepartmentRepository departmentRepository,
            @org.springframework.context.annotation.Lazy PasswordEncoder passwordEncoder,
            @org.springframework.context.annotation.Lazy SubjectRepository subjectRepository,
            @org.springframework.context.annotation.Lazy SemesterRepository semesterRepository,
            @org.springframework.context.annotation.Lazy GradeRepository gradeRepository,
            @org.springframework.context.annotation.Lazy StudentAcademicRepository studentAcademicRepository,
            @org.springframework.context.annotation.Lazy AttendanceRecordRepository attendanceRecordRepository,
            @org.springframework.context.annotation.Lazy StudentSubjectRepository studentSubjectRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.subjectRepository = subjectRepository;
        this.semesterRepository = semesterRepository;
        this.gradeRepository = gradeRepository;
        this.studentAcademicRepository = studentAcademicRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.studentSubjectRepository = studentSubjectRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting Bulk Student Data Integration (Zero-Trust Identity Seeding)...");
        
        Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                .orElseThrow(() -> new RuntimeException("STUDENT role not found"));
        
        Department cse = departmentRepository.findByCode("CSE")
                .orElseGet(() -> departmentRepository.save(Department.builder().code("CSE").deptName("B.E. CSE").build()));
        
        Department csbs = departmentRepository.findByCode("CSBS")
                .orElseGet(() -> departmentRepository.save(Department.builder().code("CSBS").deptName("B.Tech CS & BS").build()));

        seedStaffAccounts();
        seedCurriculum(cse, "B.E. CSE");
        seedCurriculum(csbs, "B.Tech CS & BS");

        // CSE-A Batch 2024-2028
        seedBatch(cse, "CSE-A", "2024-2028", createCseAData(), studentRole);
        
        // CSBS Batch 2024-2028
        seedBatch(csbs, "CSBS-C", "2024-2028", createCsbsData(), studentRole);
        
        seedOperationsSuiteData(cse);
        seedSmartCampusSuiteData();
        seedPhysicalTwinData();

        log.info("Student Data Integration Complete.");
    }

    private void seedSmartCampusSuiteData() {
        log.info("Seeding Next-Gen Smart Campus Suite Data...");

        // 1. Hostel & Room Seeding
        if (hostelRepository.count() == 0) {
            Hostel blockA = hostelRepository.save(Hostel.builder()
                    .name("Block A - Boys Resonance")
                    .capacity(200)
                    .warden("Mr. Warden")
                    .type("Boys")
                    .build());
            
            Room room101 = roomRepository.save(Room.builder()
                    .hostel(blockA)
                    .roomNumber("A-101")
                    .capacity(4)
                    .occupancy(0)
                    .status("Available")
                    .build());

            // Assign Austin to Room 101
            userRepository.findByUsername("2117240020044").ifPresent(user -> {
                if (user.getLinkedStudent() != null) {
                    hostelService.assignStudentToRoom(user.getLinkedStudent().getId(), room101.getId());
                    log.info("Assigned Austin to Room A-101");
                }
            });
        }

        // 2. Placement Seeding
        if (companyRepository.count() == 0) {
            Company google = companyRepository.save(Company.builder()
                    .name("Google")
                    .industry("Tech")
                    .email("careers@google.com")
                    .build());
            
            opportunityRepository.save(PlacementOpportunity.builder()
                    .company(google)
                    .role("Software Engineer")
                    .type("Placement")
                    .eligibility("CGPA > 8.5")
                    .deadline(java.time.LocalDate.now().plusMonths(2))
                    .status("Open")
                    .build());
        }

        // 3. Trigger initial Analytics
        attendanceAnalyticsService.runAttendanceAnalysisForAllStudents();
        studentSuccessService.runPerformanceAnalysisForAllStudents();
        log.info("Smart Campus Analytics run complete.");
    }

    private void seedPhysicalTwinData() {
        if (buildingRepository.count() > 0) return;
        
        log.info("Seeding Physical Campus Twin...");
        Building mainBlock = buildingRepository.save(Building.builder()
                .name("Main Academic Block").code("MAIN").totalCapacity(1500)
                .baseEnergyLoad(new BigDecimal("150.0")).location("Center Campus").build());
        
        Building labBlock = buildingRepository.save(Building.builder()
                .name("Advanced Research Lab").code("LAB-X").totalCapacity(500)
                .baseEnergyLoad(new BigDecimal("350.0")).location("North Wing").build());

        Classroom hall101 = classroomRepository.save(Classroom.builder()
                .name("LEC-101").building(mainBlock).capacity(60).type("Lecture Hall")
                .peakLoadMultiplier(new BigDecimal("1.2")).build());

        Classroom labA = classroomRepository.save(Classroom.builder()
                .name("LAB-A").building(labBlock).capacity(30).type("Computer Lab")
                .peakLoadMultiplier(new BigDecimal("2.5")).build());

        // Assign classrooms to existing timetable slots (just sample assigning)
        List<TimetableSlot> slots = timetableSlotRepository.findAll();
        for (int i=0; i<slots.size(); i++) {
            TimetableSlot s = slots.get(i);
            s.setClassroom(i % 2 == 0 ? hall101 : labA);
            timetableSlotRepository.save(s);
        }
        log.info("Physical Twin Seeding Complete.");
    }

    private void seedStaffAccounts() {
        Role adminRole = roleRepository.findByRoleName(Role.UserRole.ADMIN).orElse(null);
        Role facultyRole = roleRepository.findByRoleName(Role.UserRole.FACULTY).orElse(null);
        Role hodRole = roleRepository.findByRoleName(Role.UserRole.HOD).orElse(null);
        
        if (adminRole != null) ensureStaffUser("ADM-001", "Admin User", adminRole);
        if (facultyRole != null) ensureStaffUser("FAC-001", "Faculty Member", facultyRole);
        if (hodRole != null) ensureStaffUser("HOD-001", "Head of Department", hodRole);
    }

    private void seedOperationsSuiteData(Department cseDept) {
        // 1. Parent Account
        userRepository.findByUsername("2117240020044").ifPresent(studentUser -> {
            Student student = studentUser.getLinkedStudent();
            if (student != null && parentRepository.findByUser_Id(studentUser.getId()).isEmpty()) {
                Role parentRole = roleRepository.findByRoleName(Role.UserRole.PARENT).orElse(null);
                if (parentRole != null && userRepository.findByUsername("P-2117240020044").isEmpty()) {
                    User parentUser = User.builder()
                            .username("P-2117240020044")
                            .password(passwordEncoder.encode("password123"))
                            .email("parent44@example.com")
                            .firstName("Mr. Joshua")
                            .lastName("M")
                            .role(parentRole)
                            .accountStatus("active")
                            .mustChangePassword(true)
                            .build();
                    parentUser = userRepository.save(parentUser);
                    Parent parent = Parent.builder()
                            .user(parentUser)
                            .student(student)
                            .name("Mr. Joshua M")
                            .contactInfo("9876543210")
                            .relationship("Father")
                            .build();
                    parentRepository.save(parent);
                    log.info("Seeded Parent Account for Austin Joshua M");
                }
            }
        });

        // 2. Transport Route
        if (transportRouteRepository.count() == 0) {
            TransportRoute route = new TransportRoute();
            route.setRouteName("Central Station");
            route.setRouteNumber("R-01");
            route.setStartPoint("Tambaram");
            route.setEndPoint("RIT Campus");
            route.setBusNumber("TN-01-AB-1234");
            route.setCoordinatorName("Mr. Driver");
            route.setCoordinatorPhone("9999999999");
            final TransportRoute savedRoute = transportRouteRepository.save(route);

            // Assign Austin to Route
            userRepository.findByUsername("2117240020044").ifPresent(studentUser -> {
                Student student = studentUser.getLinkedStudent();
                if (student != null) {
                    StudentTransportMapping map = new StudentTransportMapping();
                    map.setStudent(student);
                    map.setRoute(savedRoute);
                    map.setPickupPoint("Tambaram Stop 1");
                    studentTransportRepository.save(map);
                }
            });
            log.info("Seeded Transport Route and assigned student");
        }

        // 3. Faculty Allocation
        userRepository.findByUsername("FAC-001").ifPresent(facUser -> {
            FacultyProfile fp = facultyProfileRepository.findByUser_Id(facUser.getId())
                    .orElseGet(() -> facultyProfileRepository.save(FacultyProfile.builder().user(facUser).employeeCode("FAC-001").department("CSE").status("active").build()));
            
            if (facultySubjectRepository.findByFaculty_User_Id(facUser.getId()).isEmpty()) {
                Semester sem1 = semesterRepository.findBySemesterNumber(1).orElseThrow();
                subjectRepository.findBySubjectCode("CS1101-CSE").ifPresent(subject -> {
                    facultySubjectRepository.save(FacultySubject.builder()
                            .faculty(fp).subject(subject).semester(sem1).section("CSE-A").academicYear(2024).build());
                });
                log.info("Seeded Faculty Allocation for FAC-001");
            }
        });
    }

    private void ensureStaffUser(String username, String name, Role role) {
        if (userRepository.findByUsername(username).isPresent()) return;
        String[] parts = name.split(" ", 2);
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(username))
                .email(username.toLowerCase() + "@ritchennai.edu.in")
                .firstName(parts[0])
                .lastName(parts.length > 1 ? parts[1] : "")
                .role(role)
                .accountStatus("active")
                .mustChangePassword(true)
                .build();
        userRepository.save(user);
    }

    private void seedCurriculum(Department dept, String deptName) {
        Semester sem1 = semesterRepository.findBySemesterNumber(1)
                .orElseGet(() -> semesterRepository.save(Semester.builder().semesterNumber(1).build()));
        
        seedSubject("MA1101-" + dept.getCode(), "Mathematics I", 4, sem1, dept, deptName);
        seedSubject("PH1101-" + dept.getCode(), "Physics", 3, sem1, dept, deptName);
        seedSubject("GE1101-" + dept.getCode(), "Engineering Graphics", 4, sem1, dept, deptName);
        seedSubject("CS1101-" + dept.getCode(), "Programming Fundamentals", 3, sem1, dept, deptName);
        seedSubject("HS1101-" + dept.getCode(), "English", 2, sem1, dept, deptName);
        seedSubject("EE1101-" + dept.getCode(), "Basic Electrical Engineering", 3, sem1, dept, deptName);
    }

    private void seedSubject(String code, String name, int credits, Semester semester, Department dept, String deptName) {
        Subject subject = subjectRepository.findBySubjectCode(code).orElseGet(Subject::new);
        subject.setSubjectCode(code);
        subject.setSubjectName(name);
        subject.setCredits(credits);
        subject.setDepartment(dept);
        subject.setDepartmentName(deptName);
        subject.setSemester(semester);
        subject.setRegulation("R2024");
        subjectRepository.save(subject);
    }

    private void seedBatch(Department dept, String section, String batch, List<StudentInfo> records, Role role) {
        int created = 0;
        Semester sem1 = semesterRepository.findBySemesterNumber(1).orElseThrow();
        List<Subject> subjects = subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(1, dept.getDeptName());

        for (StudentInfo info : records) {
            if (userRepository.findByUsername(info.regNo).isPresent()) continue;

            User user = User.builder()
                    .username(info.regNo)
                    .password(passwordEncoder.encode(info.regNo)) // Default password = register number
                    .email(info.regNo + "@ritchennai.edu.in")
                    .firstName(info.firstName)
                    .lastName(info.lastName)
                    .role(role)
                    .department(dept)
                    .accountStatus("active")
                    .mustChangePassword(true) // Mandatory change on first login
                    .build();
            user = userRepository.save(user);

            Student student = Student.builder()
                    .user(user)
                    .registerNo(info.regNo)
                    .studentIdNumber("24" + dept.getCode() + info.regNo.substring(info.regNo.length() - 3))
                    .studentName(info.firstName + " " + info.lastName)
                    .section(section)
                    .batch(batch)
                    .year(1)
                    .currentSemester(1)
                    .status("active")
                    .department(dept)
                    .scholarType(info.isHosteller ? "Hosteller" : "Day Scholar")
                    .email(user.getEmail())
                    .build();
            student = studentRepository.save(student);
            
            user.setLinkedStudent(student);
            userRepository.save(user);

            assignSubjectsAndGrades(student, sem1, subjects, performanceFactor(info.regNo));
            created++;
        }
        log.info("Seeded {} new students with full data for section {}", created, section);
    }

    private void assignSubjectsAndGrades(Student student, Semester sem, List<Subject> subjects, double factor) {
        Random random = new Random(student.getRegisterNo().hashCode());
        BigDecimal totalGradePoints = BigDecimal.ZERO;
        int totalCredits = 0;

        for (Subject sub : subjects) {
            StudentSubject ss = studentSubjectRepository.save(StudentSubject.builder()
                    .student(student)
                    .subject(sub)
                    .semester(sem)
                    .status("active")
                    .build());

            int totalClasses = 45;
            int attended = (int) (totalClasses * (0.72 + random.nextDouble() * 0.26));
            for (int i=0; i<attended; i++) {
                attendanceRecordRepository.save(AttendanceRecord.builder()
                        .studentSubject(ss)
                        .date(java.time.LocalDate.now().minusDays(i))
                        .status("Present")
                        .build());
            }

            double internalBase = 28 + (factor * 6) + (random.nextDouble() * 6);
            double externalBase = 40 + (factor * 12) + (random.nextDouble() * 18);
            BigDecimal internal = bd(internalBase, 50);
            BigDecimal external = bd(externalBase, 100);
            BigDecimal total = internal.add(external).setScale(2, RoundingMode.HALF_UP);
            GradeScale gs = toGrade(total.doubleValue());

            gradeRepository.save(Grade.builder()
                    .student(student)
                    .subject(sub)
                    .semester(sem)
                    .internalMarks(internal)
                    .externalMarks(external)
                    .totalMarks(total)
                    .gradeLetter(gs.letter)
                    .gradePoints(BigDecimal.valueOf(gs.points))
                    .build());

            totalGradePoints = totalGradePoints.add(BigDecimal.valueOf(gs.points * sub.getCredits()));
            totalCredits += sub.getCredits();
        }

        BigDecimal cgpa = totalCredits == 0 ? BigDecimal.ZERO : totalGradePoints.divide(BigDecimal.valueOf(totalCredits), 2, RoundingMode.HALF_UP);
        studentAcademicRepository.save(StudentAcademic.builder()
                .student(student)
                .semester(sem.getSemesterNumber())
                .gpa(cgpa)
                .cgpa(cgpa)
                .build());
        student.setCurrentCgpa(cgpa);
        studentRepository.save(student);
    }

    private List<StudentInfo> createCseAData() {
        List<StudentInfo> list = new ArrayList<>();
        String[] firstNames = {"Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharva", "Kabir", "Rishi", "Austin", "Ethan", "Noah", "Oliver", "Lucas", "Mason"};
        String[] lastNames = {"Kumar", "Singh", "Sharma", "Patel", "Reddy", "Rao", "Nair", "Iyer", "Pillai", "George", "Thomas", "Smith", "Johnson", "Williams", "Brown", "Jones"};

        for (long i = 2117240020001L; i <= 2117240020062L; i++) {
            String fName = firstNames[(int) (i % firstNames.length)];
            String lName = lastNames[(int) (i % lastNames.length)];
            
            if (i == 2117240020044L) {
                fName = "Austin";
                lName = "Joshua M";
            } else if (i == 2117240020045L) {
                fName = "John";
                lName = "Doe";
            }
            list.add(new StudentInfo(String.valueOf(i), fName, lName, i % 2 == 0));
        }
        return list;
    }

    private List<StudentInfo> createCsbsData() {
        List<StudentInfo> list = new ArrayList<>();
        String[] firstNames = {"Neha", "Priya", "Sneha", "Anjali", "Kavya", "Riya", "Diya", "Isha", "Maya", "Tara", "Sophia", "Emma", "Olivia", "Ava", "Isabella"};
        String[] lastNames = {"Gupta", "Das", "Menon", "Krishnan", "Verma", "Mehta", "Bose", "Ghosh", "Datta", "Davis", "Miller", "Wilson", "Moore", "Taylor"};

        for (long i = 2117240080119L; i <= 2117240080177L; i++) {
            String fName = firstNames[(int) (i % firstNames.length)];
            String lName = lastNames[(int) (i % lastNames.length)];
            list.add(new StudentInfo(String.valueOf(i), fName, lName, i % 2 != 0));
        }
        return list;
    }

    private static class StudentInfo {
        String regNo;
        String firstName;
        String lastName;
        boolean isHosteller;

        StudentInfo(String regNo, String firstName, String lastName, boolean isHosteller) {
            this.regNo = regNo;
            this.firstName = firstName;
            this.lastName = lastName;
            this.isHosteller = isHosteller;
        }
    }

    private static double performanceFactor(String key) {
        int hash = Math.abs(key.hashCode());
        int bucket = hash % 10;
        if (bucket <= 2) return 2.8; 
        if (bucket <= 7) return 1.8; 
        return 0.9; 
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
    private record GradeScale(String letter, double points) {}

    private static BigDecimal bd(double value, int max) {
        double bounded = Math.max(0, Math.min(value, max));
        return BigDecimal.valueOf(bounded).setScale(2, RoundingMode.HALF_UP);
    }
}
