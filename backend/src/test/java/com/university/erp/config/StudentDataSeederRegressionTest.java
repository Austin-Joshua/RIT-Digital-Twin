package com.university.erp.config;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class StudentDataSeederRegressionTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private GradeRepository gradeRepository;
    @Mock
    private StudentAcademicRepository studentAcademicRepository;
    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;
    @Mock
    private StudentSubjectRepository studentSubjectRepository;
    @Mock
    private ParentRepository parentRepository;
    @Mock
    private FacultySubjectRepository facultySubjectRepository;
    @Mock
    private FacultyProfileRepository facultyProfileRepository;
    @Mock
    private TransportRouteRepository transportRouteRepository;
    @Mock
    private StudentTransportRepository studentTransportRepository;
    @Mock
    private HostelRepository hostelRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private PlacementOpportunityRepository opportunityRepository;
    @Mock
    private AttendanceAnalyticsService attendanceAnalyticsService;
    @Mock
    private StudentSuccessService studentSuccessService;
    @Mock
    private HostelService hostelService;
    @Mock
    private BuildingRepository buildingRepository;
    @Mock
    private ClassroomRepository classroomRepository;
    @Mock
    private TimetableSlotRepository timetableSlotRepository;
    @Mock
    private CampusCredentialAlignment campusCredentialAlignment;
    @Mock
    private AttendanceRiskRepository attendanceRiskRepository;
    @Mock
    private PerformanceWarningRepository performanceWarningRepository;

    @Captor
    private ArgumentCaptor<List<AttendanceRecord>> attendanceCaptor;

    @InjectMocks
    private StudentDataSeeder studentDataSeeder;

    private Student testStudent;
    private User testUser;
    private Semester sem1;
    private Subject mathSubject;
    private StudentSubject existingStudentSubject;

    @BeforeEach
    void setUp() {
        studentDataSeeder.setSelf(studentDataSeeder);
        ReflectionTestUtils.setField(studentDataSeeder, "parentRepository", parentRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "facultySubjectRepository", facultySubjectRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "facultyProfileRepository", facultyProfileRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "transportRouteRepository", transportRouteRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "studentTransportRepository", studentTransportRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "hostelRepository", hostelRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "roomRepository", roomRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "companyRepository", companyRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "opportunityRepository", opportunityRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "attendanceAnalyticsService", attendanceAnalyticsService);
        ReflectionTestUtils.setField(studentDataSeeder, "studentSuccessService", studentSuccessService);
        ReflectionTestUtils.setField(studentDataSeeder, "hostelService", hostelService);
        ReflectionTestUtils.setField(studentDataSeeder, "buildingRepository", buildingRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "classroomRepository", classroomRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "timetableSlotRepository", timetableSlotRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "campusCredentialAlignment", campusCredentialAlignment);
        ReflectionTestUtils.setField(studentDataSeeder, "attendanceRiskRepository", attendanceRiskRepository);
        ReflectionTestUtils.setField(studentDataSeeder, "performanceWarningRepository", performanceWarningRepository);

        testUser = User.builder()
                .userId(100L)
                .username("2117240020044")
                .email("austin.240044@cse.ritchennai.edu.in")
                .password("hashed_secret")
                .build();

        testStudent = Student.builder()
                .id(200L)
                .registerNo("2117240020044")
                .studentName("Austin Joshua")
                .user(testUser)
                .build();

        sem1 = Semester.builder()
                .semesterId(1L)
                .semesterNumber(1)
                .build();

        Department cse = Department.builder()
                .id(10L)
                .code("CSE")
                .deptName("B.E. Computer Science and Engineering")
                .build();

        mathSubject = Subject.builder()
                .id(300L)
                .subjectCode("MA1101-CSE")
                .subjectName("Mathematics I")
                .credits(4)
                .semester(sem1)
                .department(cse)
                .build();

        existingStudentSubject = StudentSubject.builder()
                .studentSubjectId(500L)
                .student(testStudent)
                .subject(mathSubject)
                .semester(sem1)
                .status("active")
                .build();
    }

    @Test
    @DisplayName("Idempotency: existing StudentSubject reuses record and skips attendance re-insertion")
    void testAssignSubjectsAndGrades_WhenAlreadySeeded_SkipsAttendanceAndSubjectCreation() throws Exception {
        // Arrange: StudentSubject already exists in DB
        when(studentSubjectRepository.findByStudent_IdAndSubject_IdAndSemester_SemesterId(200L, 300L, 1L))
                .thenReturn(Optional.of(existingStudentSubject));

        // Attendance records already present for this StudentSubject
        when(attendanceRecordRepository.countByStudentSubject_StudentSubjectId(500L)).thenReturn(100L);

        // Grade already present
        when(gradeRepository.existsByStudent_IdAndSubject_IdAndSemester_SemesterId(200L, 300L, 1L)).thenReturn(true);

        // Act: invoke private assignSubjectsAndGrades via reflection
        Method method = StudentDataSeeder.class.getDeclaredMethod(
                "assignSubjectsAndGrades", Student.class, Semester.class, List.class, double.class);
        method.setAccessible(true);
        method.invoke(studentDataSeeder, testStudent, sem1, List.of(mathSubject), 1.0);

        // Assert:
        // 1. Never save a new or duplicate StudentSubject
        verify(studentSubjectRepository, never()).save(any(StudentSubject.class));

        // 2. Never insert attendance records
        verify(attendanceRecordRepository, never()).save(any(AttendanceRecord.class));
        verify(attendanceRecordRepository, never()).saveAll(anyIterable());

        // 3. Never insert duplicate grades
        verify(gradeRepository, never()).save(any(Grade.class));
    }

    @Test
    @DisplayName("New Enrollment: assigns subjects and batches attendance with saveAll")
    void testAssignSubjectsAndGrades_WhenNew_CreatesSubjectAndBatchesAttendance() throws Exception {
        // Arrange: StudentSubject does NOT exist yet
        when(studentSubjectRepository.findByStudent_IdAndSubject_IdAndSemester_SemesterId(200L, 300L, 1L))
                .thenReturn(Optional.empty());

        when(studentSubjectRepository.save(any(StudentSubject.class))).thenReturn(existingStudentSubject);
        when(attendanceRecordRepository.countByStudentSubject_StudentSubjectId(500L)).thenReturn(0L);
        when(gradeRepository.existsByStudent_IdAndSubject_IdAndSemester_SemesterId(200L, 300L, 1L)).thenReturn(false);

        Method method = StudentDataSeeder.class.getDeclaredMethod(
                "assignSubjectsAndGrades", Student.class, Semester.class, List.class, double.class);
        method.setAccessible(true);
        method.invoke(studentDataSeeder, testStudent, sem1, List.of(mathSubject), 1.0);

        // Assert:
        // 1. Saves the new StudentSubject once
        verify(studentSubjectRepository, times(1)).save(any(StudentSubject.class));

        // 2. Saves all 100 attendance records in a single batched saveAll call (not 100 single saves)
        verify(attendanceRecordRepository, never()).save(any(AttendanceRecord.class));
        verify(attendanceRecordRepository, times(1)).saveAll(attendanceCaptor.capture());
        assertEquals(100, attendanceCaptor.getValue().size());

        // 3. Saves grade and academic records
        verify(gradeRepository, times(1)).save(any(Grade.class));
        verify(studentAcademicRepository, times(1)).save(any(StudentAcademic.class));
    }

    @Test
    @DisplayName("Shutdown Safety: destroy() sets cancelled flag and terminates performSeeding cleanly")
    void testSeederAbortsGracefullyWhenCancelled() {
        assertFalse(studentDataSeeder.isCancelled());

        // Trigger container shutdown hook
        studentDataSeeder.destroy();

        assertTrue(studentDataSeeder.isCancelled());

        // Calling performSeeding when cancelled should return immediately without executing queries
        studentDataSeeder.performSeeding();

        verify(roleRepository, never()).findByRoleName(any());
        verify(departmentRepository, never()).findByCode(any());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    @DisplayName("Idempotency: seedBatch skips provisioning when student, user, and subject mappings exist")
    void testSeedBatch_WhenStudentAlreadyFullyProvisioned_SkipsProcessing() {
        testUser.setLinkedStudent(testStudent);
        when(semesterRepository.findBySemesterNumber(1)).thenReturn(Optional.of(sem1));
        when(subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(anyInt(), anyString()))
                .thenReturn(List.of(mathSubject));
        when(userRepository.findByUsername("2117240020044")).thenReturn(Optional.of(testUser));
        when(studentRepository.findByRegisterNo("2117240020044")).thenReturn(Optional.of(testStudent));
        when(studentSubjectRepository.existsByStudent_IdAndSemester_SemesterId(200L, 1L)).thenReturn(true);

        Department dept = Department.builder().id(10L).code("CSE").deptName("B.E. Computer Science and Engineering").build();
        Role role = Role.builder().roleId(1L).roleName(Role.UserRole.STUDENT).build();

        StudentDataSeeder.StudentInfo studentInfo = new StudentDataSeeder.StudentInfo("2117240020044", "Austin", "Joshua", false);
        studentDataSeeder.seedBatch(dept, "CSE-A", "2024-2028", List.of(studentInfo), role);

        // Verify that existing user was never saved again and password was never re-hashed
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("New Student: seedBatch provisions User, Student, Parent, and enrolls in subjects")
    void testSeedBatch_WhenNewStudent_ProvisionsUserStudentAndParent() {
        when(semesterRepository.findBySemesterNumber(1)).thenReturn(Optional.of(sem1));
        when(subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(anyInt(), anyString()))
                .thenReturn(List.of(mathSubject));
        when(userRepository.findByUsername("2117240020099")).thenReturn(Optional.empty());
        when(studentRepository.findByRegisterNo("2117240020099")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Department dept = Department.builder().id(10L).code("CSE").deptName("B.E. CSE").build();
        Role studentRole = Role.builder().roleId(1L).roleName(Role.UserRole.STUDENT).build();
        Role parentRole = Role.builder().roleId(2L).roleName(Role.UserRole.PARENT).build();
        when(roleRepository.findByRoleName(Role.UserRole.PARENT)).thenReturn(Optional.of(parentRole));

        when(studentSubjectRepository.findByStudent_IdAndSubject_IdAndSemester_SemesterId(any(), any(), any()))
                .thenReturn(Optional.of(existingStudentSubject));
        when(attendanceRecordRepository.countByStudentSubject_StudentSubjectId(anyLong())).thenReturn(100L);
        when(parentRepository.findByUser_Id(any())).thenReturn(Optional.empty());

        StudentDataSeeder.StudentInfo newStudent = new StudentDataSeeder.StudentInfo("2117240020099", "New", "Student", false);
        studentDataSeeder.seedBatch(dept, "CSE-A", "2024-2028", List.of(newStudent), studentRole);

        // Verify user, student, and parent were created and saved
        verify(userRepository, atLeastOnce()).save(any(User.class));
        verify(studentRepository, atLeastOnce()).save(any(Student.class));
        verify(parentRepository, times(1)).save(any(Parent.class));
    }

    @Test
    @DisplayName("Idempotency: seedSubject skips saving when subject already exists")
    void testSeedSubject_WhenAlreadyPresent_SkipsSaving() throws Exception {
        when(subjectRepository.findBySubjectCode("MA1101-CSE")).thenReturn(Optional.of(mathSubject));

        Department dept = Department.builder().id(10L).code("CSE").deptName("B.E. CSE").build();
        Method method = StudentDataSeeder.class.getDeclaredMethod(
                "seedSubject", String.class, String.class, int.class, Semester.class, Department.class, String.class);
        method.setAccessible(true);
        method.invoke(studentDataSeeder, "MA1101-CSE", "Mathematics I", 4, sem1, dept, "B.E. CSE");

        verify(subjectRepository, never()).save(any(Subject.class));
    }

    @Test
    @DisplayName("Analytics Optimization: seedSmartCampusSuiteData skips expensive calculations when baseline exists")
    void testSeedSmartCampusSuiteData_WhenAnalyticsAlreadyExist_SkipsExecution() throws Exception {
        // Analytics repositories already have data
        when(attendanceRiskRepository.count()).thenReturn(122L);
        when(performanceWarningRepository.count()).thenReturn(122L);
        when(hostelRepository.count()).thenReturn(1L);
        when(companyRepository.count()).thenReturn(1L);

        Method method = StudentDataSeeder.class.getDeclaredMethod("seedSmartCampusSuiteData");
        method.setAccessible(true);
        method.invoke(studentDataSeeder);

        // Verify that full O(N) attendance analysis and performance analysis are never triggered
        verify(attendanceAnalyticsService, never()).runAttendanceAnalysisForAllStudents();
        verify(studentSuccessService, never()).runPerformanceAnalysisForAllStudents();
    }

    @Test
    @DisplayName("Analytics Initial Seed: seedSmartCampusSuiteData populates baseline when empty")
    void testSeedSmartCampusSuiteData_WhenAnalyticsEmpty_RunsInitialAnalytics() throws Exception {
        when(attendanceRiskRepository.count()).thenReturn(0L);
        when(performanceWarningRepository.count()).thenReturn(0L);
        when(hostelRepository.count()).thenReturn(1L);
        when(companyRepository.count()).thenReturn(1L);

        Method method = StudentDataSeeder.class.getDeclaredMethod("seedSmartCampusSuiteData");
        method.setAccessible(true);
        method.invoke(studentDataSeeder);

        verify(attendanceAnalyticsService, times(1)).runAttendanceAnalysisForAllStudents();
        verify(studentSuccessService, times(1)).runPerformanceAnalysisForAllStudents();
    }

    @Test
    @DisplayName("Full Orchestration: performSeeding executes safely through all seed phases")
    void testPerformSeeding_FullPipeline_ExecutesSafely() {
        testUser.setLinkedStudent(testStudent);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Role studentRole = Role.builder().roleId(1L).roleName(Role.UserRole.STUDENT).build();
        when(roleRepository.findByRoleName(Role.UserRole.STUDENT)).thenReturn(Optional.of(studentRole));

        Department cse = Department.builder().id(10L).code("CSE").deptName("B.E. Computer Science and Engineering").build();
        Department csbs = Department.builder().id(20L).code("CSBS").deptName("B.Tech Computer Science and Business Systems").build();
        when(departmentRepository.findByCode("CSE")).thenReturn(Optional.of(cse));
        when(departmentRepository.findByCode("CSBS")).thenReturn(Optional.of(csbs));

        when(userRepository.findByEmail("faculty@ritchennai.edu.in")).thenReturn(Optional.of(testUser));
        when(semesterRepository.findBySemesterNumber(anyInt())).thenReturn(Optional.of(sem1));
        when(subjectRepository.findBySubjectCode(anyString())).thenReturn(Optional.of(mathSubject));
        when(subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(anyInt(), anyString()))
                .thenReturn(List.of(mathSubject));

        // Treat all students as already provisioned to test pure pipeline execution
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(testUser));
        when(studentRepository.findByRegisterNo(anyString())).thenReturn(Optional.of(testStudent));
        when(studentSubjectRepository.existsByStudent_IdAndSemester_SemesterId(anyLong(), anyLong())).thenReturn(true);

        when(hostelRepository.count()).thenReturn(1L);
        when(companyRepository.count()).thenReturn(1L);
        when(attendanceRiskRepository.count()).thenReturn(122L);
        when(performanceWarningRepository.count()).thenReturn(122L);
        when(transportRouteRepository.count()).thenReturn(1L);
        when(buildingRepository.count()).thenReturn(10L);

        assertDoesNotThrow(() -> studentDataSeeder.performSeeding());

        // Verify alignment was called and no error occurred
        verify(campusCredentialAlignment, times(1)).alignClassAccounts();
    }
}

