package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.service.AcademicService;
import com.university.erp.service.StudentAcademicOnboardingService;
import com.university.erp.service.StudentProfileService;
import com.university.erp.repository.StudentLeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AcademicSecurityTest {

    private AcademicService academicService;
    private StudentProfileService studentProfileService;
    private StudentAcademicOnboardingService onboardingService;
    private StudentLeaveRequestRepository leaveRequestRepository;
    private AcademicController academicController;

    @BeforeEach
    void setUp() {
        academicService = mock(AcademicService.class);
        studentProfileService = mock(StudentProfileService.class);
        onboardingService = mock(StudentAcademicOnboardingService.class);
        leaveRequestRepository = mock(StudentLeaveRequestRepository.class);

        academicController = new AcademicController(
                academicService,
                studentProfileService,
                onboardingService,
                leaveRequestRepository
        );
    }

    @Test
    void studentCannotAccessAnotherStudentMarks_IDOR_Protection() {
        // Authenticated as Student with User ID 10
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student selfProfile = Student.builder().id(100L).user(studentUser).build();
        when(studentProfileService.getByUserId(10L)).thenReturn(selfProfile);
        when(studentProfileService.getByStudentId(101L)).thenReturn(Student.builder().id(101L).build());

        // Attempt to access student 101's marks - MUST throw AccessDeniedException
        assertThrows(AccessDeniedException.class, () -> {
            academicController.getStudentMarks(101L, null, null);
        });

        // Verify academicService was never queried for the unauthorized target
        verify(academicService, never()).getStudentMarks(101L);
    }

    @Test
    void studentCanAccessOwnMarksSuccessfully() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student selfProfile = Student.builder().id(100L).user(studentUser).build();
        when(studentProfileService.getByUserId(10L)).thenReturn(selfProfile);
        when(studentProfileService.getByStudentId(100L)).thenReturn(selfProfile);
        when(academicService.getStudentMarks(100L)).thenReturn(List.of(new Marks()));

        var response = academicController.getStudentMarks(100L, null, null);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void facultyCannotAccessStudentOfAnotherDepartment() {
        Role facultyRole = Role.builder().roleName(Role.UserRole.FACULTY).build();
        Department cseDept = Department.builder().id(1L).deptName("CSE").build();
        Department eceDept = Department.builder().id(2L).deptName("ECE").build();

        User facultyUser = User.builder().userId(20L).username("faculty.cse").department(cseDept).role(facultyRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(facultyUser, null, facultyUser.getAuthorities())
        );

        Student eceStudent = Student.builder().id(200L).department(eceDept).build();
        when(studentProfileService.getByStudentId(200L)).thenReturn(eceStudent);

        assertThrows(AccessDeniedException.class, () -> {
            academicController.getStudentMarks(200L, null, null);
        });

        verify(academicService, never()).getStudentMarks(200L);
    }
}
