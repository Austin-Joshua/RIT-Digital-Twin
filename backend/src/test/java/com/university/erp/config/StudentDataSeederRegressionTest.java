package com.university.erp.config;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.security.LoginCredentials;
import com.university.erp.service.CampusCredentialAlignment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Method;
import java.math.BigDecimal;
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
    private CampusCredentialAlignment campusCredentialAlignment;

    @InjectMocks
    private StudentDataSeeder studentDataSeeder;

    private Student testStudent;
    private User testUser;
    private Semester sem1;
    private Subject mathSubject;
    private StudentSubject existingStudentSubject;

    @BeforeEach
    void setUp() {
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
        ArgumentCaptor<List<AttendanceRecord>> captor = ArgumentCaptor.forClass(List.class);
        verify(attendanceRecordRepository, times(1)).saveAll(captor.capture());
        assertEquals(100, captor.getValue().size());

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
}

