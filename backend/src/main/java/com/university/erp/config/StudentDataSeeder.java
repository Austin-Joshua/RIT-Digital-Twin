package com.university.erp.config;

import com.university.erp.model.*;
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
import java.util.concurrent.CompletableFuture;

@Component
@Slf4j
@org.springframework.core.annotation.Order(2)
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

    private User facultyUser; // Cached faculty for recording attendance

    @org.springframework.beans.factory.annotation.Autowired
    private ParentRepository parentRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private FacultySubjectRepository facultySubjectRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private TransportRouteRepository transportRouteRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private StudentTransportRepository studentTransportRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private HostelRepository hostelRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private RoomRepository roomRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private CompanyRepository companyRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private PlacementOpportunityRepository opportunityRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private AttendanceAnalyticsService attendanceAnalyticsService;

    @org.springframework.beans.factory.annotation.Autowired
    private StudentSuccessService studentSuccessService;

    @org.springframework.beans.factory.annotation.Autowired
    private HostelService hostelService;

    @org.springframework.beans.factory.annotation.Autowired
    private BuildingRepository buildingRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private ClassroomRepository classroomRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private TimetableSlotRepository timetableSlotRepository;

    public StudentDataSeeder(
            UserRepository userRepository,
            StudentRepository studentRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            SubjectRepository subjectRepository,
            SemesterRepository semesterRepository,
            GradeRepository gradeRepository,
            StudentAcademicRepository studentAcademicRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            StudentSubjectRepository studentSubjectRepository) {
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

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private StudentDataSeeder self; // Self-injection for proxy-aware @Transactional calls from async

    @Override
    public void run(String... args) {
        CompletableFuture.runAsync(() -> {
            log.info("Starting Async Bulk Student Data Integration (Zero-Trust Identity Seeding)...");
            try {
                self.performSeeding(); // Call through Spring proxy so @Transactional works
                log.info("Student Data Integration Complete.");
            } catch (Exception e) {
                log.error("StudentDataSeeder encountered an error in background thread: {}", e.getMessage());
                log.debug("Seeder stack trace:", e);
            }
        });
    }

    @Transactional
    public void performSeeding() {
        try {
            Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                .orElseThrow(() -> new RuntimeException("STUDENT role not found"));
        
        Department cse = departmentRepository.findByCode("CSE")
                .orElseGet(() -> departmentRepository.save(Department.builder().code("CSE").deptName("B.E. CSE").build()));
        
        // Fetch a default faculty to record attendance
        this.facultyUser = userRepository.findByEmail("faculty@ritchennai.edu.in")
            .orElseGet(() -> userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getRoleName() == Role.UserRole.FACULTY)
                .findFirst()
                .orElse(null));
        
        Department csbs = departmentRepository.findByCode("CSBS")
                .orElseGet(() -> departmentRepository.save(Department.builder().code("CSBS").deptName("B.Tech CS & BS").build()));

        // seedStaffAccounts(); // Handled by DataInitializer
        seedCurriculum(cse, "B.E. CSE");
        seedCurriculum(csbs, "B.Tech CS & BS");

        // CSE-A Batch 2024-2028
        seedBatch(cse, "CSE-A", "2024-2028", createCseAData(), studentRole);
        
        // CSBS Batch 2024-2028
        seedBatch(csbs, "CSBS-C", "2024-2028", createCsbsData(), studentRole);
        
        seedOperationsSuiteData(cse);
        seedSmartCampusSuiteData();
        seedPhysicalTwinData();
        } catch (Exception e) {
             throw e;
        }
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



    private void seedOperationsSuiteData(Department cseDept) {
        // Parent accounts are now seeded automatically for all students in the seedBatch method.

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
            
            // Auto-link Parent account
            ensureParentForStudent(student);
            
            user.setLinkedStudent(student);
            userRepository.save(user);

            // Flush to ensure visibility across transactions/threads during high-scale login
            userRepository.flush();
            studentRepository.flush();

            assignSubjectsAndGrades(student, sem1, subjects, performanceFactor(info.regNo));
            created++;
        }
        log.info("Seeded {} new students with full data for section {}", created, section);
    }

    private void ensureParentForStudent(Student student) {
        String parentUsername = "P-" + student.getRegisterNo();
        if (userRepository.findByUsername(parentUsername).isPresent()) return;

        Role parentRole = roleRepository.findByRoleName(Role.UserRole.PARENT).orElse(null);
        if (parentRole == null) return;

        String parentName = student.getStudentName() != null ? student.getStudentName().split(" ")[0] : "Student";

        User parentUser = User.builder()
                .username(parentUsername)
                .password(passwordEncoder.encode("password123"))
                .email(student.getRegisterNo() + "_parent@ritchennai.edu.in")
                .firstName(parentName)
                .lastName("Parent")
                .role(parentRole)
                .accountStatus("active")
                .build();

        parentUser = userRepository.save(parentUser);

        Parent parent = Parent.builder()
                .user(parentUser)
                .student(student)
                .name(parentName + " Parent")
                .relationship("Parent")
                .build();

        parentRepository.save(parent);
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

            if (attendanceRecordRepository.countByStudentSubject_StudentSubjectId(ss.getStudentSubjectId()) > 0) {
                log.debug("Skipping attendance seeding for StudentSubject ID {}", ss.getStudentSubjectId());
            } else {
                int totalClasses = 45;
                int attended = (int) (totalClasses * (0.72 + random.nextDouble() * 0.26));
                for (int i=0; i<attended; i++) {
                    AttendanceRecord.AttendanceRecordBuilder arb = AttendanceRecord.builder()
                            .studentSubject(ss)
                            .date(java.time.LocalDate.now().minusDays(i))
                            .status("Present");
                    
                    if (facultyUser != null) {
                        arb.recordedBy(facultyUser);
                    }
                    
                    attendanceRecordRepository.save(arb.build());
                }
            }

            if (gradeRepository.existsByStudent_IdAndSubject_IdAndSemester_SemesterId(student.getId(), sub.getId(), sem.getSemesterId())) {
                log.debug("Skipping grade seeding for student {} and subject {}", student.getId(), sub.getId());
                continue;
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
        list.add(new StudentInfo("2117240020001", "AAKASH", "B K", false));
        list.add(new StudentInfo("2117240020002", "AARTHI", "M", true));
        list.add(new StudentInfo("2117240020003", "AASHIDA", "V", false));
        list.add(new StudentInfo("2117240020004", "ABHILASH", "M", true));
        list.add(new StudentInfo("2117240020005", "ABIMANUE", "M", false));
        list.add(new StudentInfo("2117240020006", "ABINA JERLIN", "M", false));
        list.add(new StudentInfo("2117240020007", "ABINAYA", "S G", false));
        list.add(new StudentInfo("2117240020008", "ABINESH", "S", false));
        list.add(new StudentInfo("2117240020009", "ABIRAMI", "B", true));
        list.add(new StudentInfo("2117240020010", "ABISHEK", "S", false));
        list.add(new StudentInfo("2117240020011", "ADARSH", "H", false));
        list.add(new StudentInfo("2117240020012", "ADITYA", "PARTHASARATHY", false));
        list.add(new StudentInfo("2117240020013", "AFSA", "R", false));
        list.add(new StudentInfo("2117240020014", "AISWARYAA", "BABU", false));
        list.add(new StudentInfo("2117240020015", "AKASH", "A", false));
        list.add(new StudentInfo("2117240020016", "AKSHARA", "P", false));
        list.add(new StudentInfo("2117240020017", "AKSHAY", "V", true));
        list.add(new StudentInfo("2117240020018", "AKSHAYA", "K", true));
        list.add(new StudentInfo("2117240020019", "AKSHAYA", "M", false));
        list.add(new StudentInfo("2117240020020", "AKSHAYA", "R L", false));
        list.add(new StudentInfo("2117240020021", "AKSHAYA DARSHINI", "N", false));
        list.add(new StudentInfo("2117240020022", "AKSHITHA", "P", false));
        list.add(new StudentInfo("2117240020023", "AKSHITHA", "S", false));
        list.add(new StudentInfo("2117240020024", "AMBATI", "NIKHITHA", true));
        list.add(new StudentInfo("2117240020025", "AMUDHAN", "M", true));
        list.add(new StudentInfo("2117240020026", "ANISHA", "PATHAK", false));
        list.add(new StudentInfo("2117240020027", "ANISKA", "S P", false));
        list.add(new StudentInfo("2117240020028", "ANJASRI", "V", true));
        list.add(new StudentInfo("2117240020029", "ANUSHA", "B", true));
        list.add(new StudentInfo("2117240020030", "ANU SHRI", "R", false));
        list.add(new StudentInfo("2117240020031", "ARAVINDRAJ", "D", false));
        list.add(new StudentInfo("2117240020032", "ARNAV KUMAR", "R", false));
        list.add(new StudentInfo("2117240020033", "ARVIND", "N", false));
        list.add(new StudentInfo("2117240020034", "ASANTHIKA", "A", true));
        list.add(new StudentInfo("2117240020035", "ASEEMA", "S", false));
        list.add(new StudentInfo("2117240020036", "ASHA", "A", true));
        list.add(new StudentInfo("2117240020037", "ASHWIN", "G", false));
        list.add(new StudentInfo("2117240020038", "ASIN", "D", true));
        list.add(new StudentInfo("2117240020039", "ASWANTHAR", "M", true));
        list.add(new StudentInfo("2117240020040", "ASWIN", "R", false));
        list.add(new StudentInfo("2117240020041", "ASWIN KUMAR", "E N", false));
        list.add(new StudentInfo("2117240020042", "ASWINI", "M", false));
        list.add(new StudentInfo("2117240020043", "ATHISHWAR", "J", false));
        list.add(new StudentInfo("2117240020044", "AUSTIN JOSHUA", "M", false));
        list.add(new StudentInfo("2117240020045", "AVINESHWARAN", "A", true));
        list.add(new StudentInfo("2117240020046", "BALAJI", "M R", true));
        list.add(new StudentInfo("2117240020047", "BALAJI", "P", false));
        list.add(new StudentInfo("2117240020048", "BASKAR", "J", false));
        list.add(new StudentInfo("2117240020049", "BAVATHARINI", "R", false));
        list.add(new StudentInfo("2117240020050", "BHARANIDHARAN", "R", true));
        list.add(new StudentInfo("2117240020051", "BHUVANESHWARAN", "S", true));
        list.add(new StudentInfo("2117240020052", "CATHERIN JENIRA", "I", true));
        list.add(new StudentInfo("2117240020053", "CHARUMATHI", "K", false));
        list.add(new StudentInfo("2117240020054", "CHRIS", "ALAN", true));
        list.add(new StudentInfo("2117240020055", "CHRIS MELVYN RAJ", "P", false));
        list.add(new StudentInfo("2117240020056", "CHRISTOPHER", "J", false));
        list.add(new StudentInfo("2117240020057", "DARSHAN", "A R", false));
        list.add(new StudentInfo("2117240020058", "DARSHAN", "B", false));
        list.add(new StudentInfo("2117240020059", "DEBORHAL", "L", true));
        list.add(new StudentInfo("2117240020060", "DEEPA SHREE", "C", false));
        list.add(new StudentInfo("2117240020061", "DEEPESH", "V", false));
        list.add(new StudentInfo("2117240020062", "DEEPIKA", "P", true));
        return list;
    }

    private List<StudentInfo> createCsbsData() {
        List<StudentInfo> list = new ArrayList<>();
        list.add(new StudentInfo("2117240080119", "SACHIN", "S", false));
        list.add(new StudentInfo("2117240080120", "SAI JEEVA", "S", false));
        list.add(new StudentInfo("2117240080121", "SANJANA", "M", false));
        list.add(new StudentInfo("2117240080122", "SANJAY", "S", false));
        list.add(new StudentInfo("2117240080123", "SANJAY KUMAR", "M P", true));
        list.add(new StudentInfo("2117240080124", "SANTHOSH", "M N", true));
        list.add(new StudentInfo("2117240080125", "SARAN", "S", false));
        list.add(new StudentInfo("2117240080126", "SARATH", "S D", false));
        list.add(new StudentInfo("2117240080127", "SESHARENGAN", "S", true));
        list.add(new StudentInfo("2117240080128", "SHALINI", "C", false));
        list.add(new StudentInfo("2117240080129", "SHANTANU", "DEGAPUDI", false));
        list.add(new StudentInfo("2117240080130", "SHANTHINI", "C", true));
        list.add(new StudentInfo("2117240080131", "SHARAN KUMAR", "H", false));
        list.add(new StudentInfo("2117240080132", "SHARANYA", "M", false));
        list.add(new StudentInfo("2117240080133", "SHARUKESHWARAN", "V", false));
        list.add(new StudentInfo("2117240080134", "SHEIK ABDUL KHADER", "T", true));
        list.add(new StudentInfo("2117240080135", "SHESHIKA", "P T", true));
        list.add(new StudentInfo("2117240080136", "SHIVA", "K", false));
        list.add(new StudentInfo("2117240080137", "SHREYA", "S", false));
        list.add(new StudentInfo("2117240080138", "SHRUDHI", "K H", false));
        list.add(new StudentInfo("2117240080139", "SHRUTHILAYA", "B", false));
        list.add(new StudentInfo("2117240080140", "SIDDHARTHAA", "S", false));
        list.add(new StudentInfo("2117240080141", "SOUNDARYA", "S", false));
        list.add(new StudentInfo("2117240080142", "SREELEKSHMI", "M", false));
        list.add(new StudentInfo("2117240080143", "SRI AKSHIYA", "R", true));
        list.add(new StudentInfo("2117240080144", "SRI AMUDHA VALLI", "M", false));
        list.add(new StudentInfo("2117240080145", "SRIJAN", "SAMANTA", false));
        list.add(new StudentInfo("2117240080146", "SRINITHA", "M", false));
        list.add(new StudentInfo("2117240080147", "SRIRANJANI", "NATARAJAN", false));
        list.add(new StudentInfo("2117240080148", "SRUTHI", "K", true));
        list.add(new StudentInfo("2117240080149", "SUDHARSHANA", "V", false));
        list.add(new StudentInfo("2117240080150", "SUMETHA", "V", true));
        list.add(new StudentInfo("2117240080151", "SURUTHIKA", "R", true));
        list.add(new StudentInfo("2117240080152", "SURYA", "M", true));
        list.add(new StudentInfo("2117240080153", "SURYAPRAKASH", "I", true));
        list.add(new StudentInfo("2117240080154", "SUSEE", "S", true));
        list.add(new StudentInfo("2117240080155", "SWETHA", "C", true));
        list.add(new StudentInfo("2117240080156", "SYED KAREEMULLAH SHA", "S", false));
        list.add(new StudentInfo("2117240080157", "TABITHA AEUGLE", "C B", false));
        list.add(new StudentInfo("2117240080158", "TANU SREE", "K", true));
        list.add(new StudentInfo("2117240080159", "THARUN", "P", false));
        list.add(new StudentInfo("2117240080160", "THIYANESWARAN", "N", true));
        list.add(new StudentInfo("2117240080161", "UGESH PRAAVIN", "D", false));
        list.add(new StudentInfo("2117240080162", "VAISHNAVI", "S", false));
        list.add(new StudentInfo("2117240080163", "VALLI MYLA", "G", true));
        list.add(new StudentInfo("2117240080164", "VETHANTH", "S", true));
        list.add(new StudentInfo("2117240080165", "VIJAY REDDY", "S J", false));
        list.add(new StudentInfo("2117240080166", "VISHAL", "V", false));
        list.add(new StudentInfo("2117240080167", "VISHNU PRIYA", "L", false));
        list.add(new StudentInfo("2117240080168", "VISHWA", "K", true));
        list.add(new StudentInfo("2117240080169", "VISWAJITH", "R S", false));
        list.add(new StudentInfo("2117240080170", "YAMINI", "M", false));
        list.add(new StudentInfo("2117240080171", "YAMUNA", "S", true));
        list.add(new StudentInfo("2117240080172", "YOGASRI", "J", false));
        list.add(new StudentInfo("2117240080173", "YOGEESHWAR", "P", false));
        list.add(new StudentInfo("2117240080174", "YUGANDHAR", "D", true));
        list.add(new StudentInfo("2117240080175", "YUVANRAJ", "N", false));
        list.add(new StudentInfo("2117240080176", "YUVARAJ", "Y", false));
        list.add(new StudentInfo("2117240080177", "YUVASHREE", "R", false));
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
        if (key == null) return 1.8;
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
        if (Double.isNaN(value) || Double.isInfinite(value)) value = 0.0;
        double bounded = Math.max(0, Math.min(value, max));
        return BigDecimal.valueOf(bounded).setScale(2, RoundingMode.HALF_UP);
    }
}

