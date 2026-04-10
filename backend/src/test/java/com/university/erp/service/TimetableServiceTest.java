package com.university.erp.service;

import com.university.erp.dto.TimetableGenerateRequest;
import com.university.erp.dto.TimetableGenerationResponseDto;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimetableServiceTest {

    @Mock
    private TimetableSlotRepository timetableSlotRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private FacultySubjectRepository facultySubjectRepository;
    @Mock
    private TimetableSubjectRequirementRepository requirementRepository;

    @InjectMocks
    private TimetableService timetableService;

    private Department dept;
    private Subject ds;
    private Subject dbms;
    private User facultyA;
    private User facultyB;
    private FacultySubject fsDs;
    private FacultySubject fsDbms;

    @BeforeEach
    void setUp() {
        dept = Department.builder().id(1L).code("CSE").deptName("CSE").build();
        Semester semester = Semester.builder().semesterId(1L).semesterNumber(3).build();

        ds = Subject.builder().id(11L).subjectCode("CSCA").subjectName("Data Structures").department(dept).semester(semester).build();
        dbms = Subject.builder().id(12L).subjectCode("DBMS").subjectName("Database Management Systems").department(dept).semester(semester).build();

        facultyA = User.builder().userId(101L).username("facA").firstName("Faculty").lastName("A").build();
        facultyB = User.builder().userId(102L).username("facB").firstName("Faculty").lastName("B").build();

        FacultyProfile fpA = FacultyProfile.builder().facultyId(501L).user(facultyA).build();
        FacultyProfile fpB = FacultyProfile.builder().facultyId(502L).user(facultyB).build();

        fsDs = FacultySubject.builder().facultySubjectId(1L).faculty(fpA).subject(ds).section("CSE-A").semester(semester).build();
        fsDbms = FacultySubject.builder().facultySubjectId(2L).faculty(fpB).subject(dbms).section("CSE-A").semester(semester).build();
    }

    @Test
    void strictModeFailsWhenDemandExceedsCapacity() {
        TimetableGenerateRequest request = new TimetableGenerateRequest();
        request.setDeptId(1L);
        request.setSections(List.of("CSE-A"));
        request.setSemesterNumber(3);
        request.setDaysPerWeek(1);
        request.setPeriodsPerDay(1);
        request.setStrictMode(true);

        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));
        when(facultySubjectRepository.findBySubject_Department_Id(1L)).thenReturn(List.of(fsDs, fsDbms));
        when(requirementRepository.findByDepartment_IdAndSectionIgnoreCaseAndSemester_SemesterNumber(1L, "CSE-A", 3))
                .thenReturn(List.of(
                        TimetableSubjectRequirement.builder().subject(ds).periodsPerWeek(4).section("CSE-A").department(dept).build(),
                        TimetableSubjectRequirement.builder().subject(dbms).periodsPerWeek(4).section("CSE-A").department(dept).build()
                ));

        TimetableGenerationResponseDto response = timetableService.generateWeeklyTimetable(request);

        assertFalse(response.isSuccess());
        assertNotNull(response.getValidation());
        assertTrue(response.getValidation().getUnscheduledPeriods() > 0);
        verify(timetableSlotRepository, never()).saveAll(anyList());
    }

    @Test
    void bestEffortGeneratesWithoutFacultyOrClassClash() {
        TimetableGenerateRequest request = new TimetableGenerateRequest();
        request.setDeptId(1L);
        request.setSections(List.of("CSE-A"));
        request.setSemesterNumber(3);
        request.setDaysPerWeek(5);
        request.setPeriodsPerDay(6);
        request.setStrictMode(false);

        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));
        when(facultySubjectRepository.findBySubject_Department_Id(1L)).thenReturn(List.of(fsDs, fsDbms));
        when(requirementRepository.findByDepartment_IdAndSectionIgnoreCaseAndSemester_SemesterNumber(1L, "CSE-A", 3))
                .thenReturn(List.of(
                        TimetableSubjectRequirement.builder().subject(ds).periodsPerWeek(3).section("CSE-A").department(dept).build(),
                        TimetableSubjectRequirement.builder().subject(dbms).periodsPerWeek(3).section("CSE-A").department(dept).build()
                ));
        when(timetableSlotRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        TimetableGenerationResponseDto response = timetableService.generateWeeklyTimetable(request);

        assertNotNull(response.getValidation());
        assertTrue(response.getValidation().isFacultyClashFree());
        assertTrue(response.getValidation().isClassClashFree());
        assertEquals(6, response.getValidation().getScheduledPeriods());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<TimetableSlot>> captor = ArgumentCaptor.forClass(List.class);
        verify(timetableSlotRepository).saveAll(captor.capture());
        List<TimetableSlot> saved = captor.getValue();

        Set<String> sectionTimeKeys = new HashSet<>();
        Set<String> facultyTimeKeys = new HashSet<>();
        for (TimetableSlot slot : saved) {
            String sectionKey = slot.getSection() + "|" + slot.getDayOfWeek() + "|" + slot.getStartTime();
            assertTrue(sectionTimeKeys.add(sectionKey), "Class clash detected");
            String facultyKey = slot.getFaculty().getUserId() + "|" + slot.getDayOfWeek() + "|" + slot.getStartTime();
            assertTrue(facultyTimeKeys.add(facultyKey), "Faculty clash detected");
        }
    }
}
