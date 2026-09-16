package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.service.NoDueService;
import com.university.erp.util.ErpException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NoDueSecurityTest {

    NoDueRequestRepository noDueRequestRepository;
    ClearanceDefinitionRepository clearanceDefinitionRepository;
    StudentRepository studentRepository;
    AuditLogRepository auditLogRepository;
    NoDueService noDueService;
    NoDueController noDueController;

    ClearanceDefinition libDef;
    ClearanceDefinition labDef;
    Department cseDept;
    Department eceDept;

    @BeforeEach
    void setUp() {
        noDueRequestRepository = mock(NoDueRequestRepository.class);
        clearanceDefinitionRepository = mock(ClearanceDefinitionRepository.class);
        studentRepository = mock(StudentRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);

        noDueService = new NoDueService(
                noDueRequestRepository,
                clearanceDefinitionRepository,
                studentRepository,
                auditLogRepository
        );

        noDueController = new NoDueController(noDueService);

        cseDept = Department.builder().id(1L).code("CSE").deptName("CSE").build();
        eceDept = Department.builder().id(2L).code("ECE").deptName("ECE").build();

        libDef = ClearanceDefinition.builder()
                .id(101L)
                .code("ND_LIB")
                .name("Library & Resource Center")
                .authorityType("LIBRARY")
                .active(true)
                .build();

        labDef = ClearanceDefinition.builder()
                .id(102L)
                .code("ND_LAB")
                .name("Department Computer Laboratories")
                .authorityType("LAB")
                .active(true)
                .build();
    }

    @Test
    void getMyRequests_ReturnsRealIdsAndZeroSyntheticIds() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student student = Student.builder().id(1L).user(studentUser).registerNo("2117240020044").build();
        when(studentRepository.findByUser_Id(10L)).thenReturn(Optional.of(student));

        when(clearanceDefinitionRepository.findByActiveTrueOrderByDisplayOrderAsc())
                .thenReturn(List.of(libDef, labDef));

        // Only libDef has an existing request; labDef has none
        NoDueRequest libReq = NoDueRequest.builder()
                .id(555L)
                .student(student)
                .clearanceDefinition(libDef)
                .clearanceType(libDef.getName())
                .status("PENDING")
                .build();
        when(noDueRequestRepository.findByStudent_Id(1L)).thenReturn(List.of(libReq));

        var response = noDueController.getMyNoDueRequests();
        assertEquals(200, response.getStatusCode().value());
        List<Map<String, Object>> items = response.getBody();
        assertNotNull(items);
        assertEquals(2, items.size());

        // First item (LIB) has real ID 555
        assertEquals(555L, items.get(0).get("id"));
        assertEquals("PENDING", items.get(0).get("status"));

        // Second item (LAB) has NOT been requested: id MUST BE NULL (Zero synthetic IDs!)
        assertNull(items.get(1).get("id"));
        assertEquals("NOT_REQUESTED", items.get(1).get("status"));
    }

    @Test
    void duplicateActiveClearanceRequestIsRejectedWithConflict() {
        Role studentRole = Role.builder().roleName(Role.UserRole.STUDENT).build();
        User studentUser = User.builder().userId(10L).username("2117240020044").role(studentRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(studentUser, null, studentUser.getAuthorities())
        );

        Student student = Student.builder().id(1L).user(studentUser).registerNo("2117240020044").build();
        when(studentRepository.findByUser_Id(10L)).thenReturn(Optional.of(student));
        when(clearanceDefinitionRepository.findById(101L)).thenReturn(Optional.of(libDef));

        // Already pending
        NoDueRequest existing = NoDueRequest.builder()
                .id(555L)
                .student(student)
                .clearanceDefinition(libDef)
                .status("PENDING")
                .build();
        when(noDueRequestRepository.findByStudent_IdAndClearanceDefinition_Id(1L, 101L)).thenReturn(Optional.of(existing));

        assertThrows(ErpException.ConflictException.class, () -> {
            noDueController.submitNoDueRequest(Map.of("clearanceDefinitionId", 101L));
        });
    }

    @Test
    void hodCannotProcessClearanceForStudentInAnotherDepartment() {
        Role hodRole = Role.builder().roleName(Role.UserRole.HOD).build();
        User hodCseUser = User.builder().userId(20L).username("hod.cse").department(cseDept).role(hodRole).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(hodCseUser, null, hodCseUser.getAuthorities())
        );

        // Student belongs to ECE department
        Student eceStudent = Student.builder().id(2L).department(eceDept).registerNo("2117240080001").build();
        NoDueRequest req = NoDueRequest.builder()
                .id(777L)
                .student(eceStudent)
                .status("PENDING")
                .build();
        when(noDueRequestRepository.findById(777L)).thenReturn(Optional.of(req));

        assertThrows(ErpException.UnauthorizedException.class, () -> {
            noDueService.processRequest(777L, Map.of("status", "APPROVED"), hodCseUser, "127.0.0.1");
        });
        verify(noDueRequestRepository, never()).save(any());
    }

    @Test
    void illegalStateTransitionsAreRejected() {
        Role adminRole = Role.builder().roleName(Role.UserRole.ADMIN).build();
        User adminUser = User.builder().userId(1L).username("admin").role(adminRole).build();

        Student student = Student.builder().id(1L).department(cseDept).registerNo("2117240020044").build();
        NoDueRequest approvedReq = NoDueRequest.builder()
                .id(888L)
                .student(student)
                .status("APPROVED")
                .build();
        when(noDueRequestRepository.findById(888L)).thenReturn(Optional.of(approvedReq));

        // APPROVED -> REJECTED must fail
        assertThrows(ErpException.InvalidOperationException.class, () -> {
            noDueService.processRequest(888L, Map.of("status", "REJECTED"), adminUser, "127.0.0.1");
        });

        NoDueRequest rejectedReq = NoDueRequest.builder()
                .id(889L)
                .student(student)
                .status("REJECTED")
                .build();
        when(noDueRequestRepository.findById(889L)).thenReturn(Optional.of(rejectedReq));

        // REJECTED -> APPROVED must fail
        assertThrows(ErpException.InvalidOperationException.class, () -> {
            noDueService.processRequest(889L, Map.of("status", "APPROVED"), adminUser, "127.0.0.1");
        });
    }

    @Test
    void adminCanProcessPendingClearanceSuccessfully() {
        Role adminRole = Role.builder().roleName(Role.UserRole.ADMIN).build();
        User adminUser = User.builder().userId(1L).username("admin").role(adminRole).build();

        Student student = Student.builder().id(1L).department(cseDept).registerNo("2117240020044").build();
        NoDueRequest pendingReq = NoDueRequest.builder()
                .id(999L)
                .student(student)
                .status("PENDING")
                .build();
        when(noDueRequestRepository.findById(999L)).thenReturn(Optional.of(pendingReq));
        when(noDueRequestRepository.save(any(NoDueRequest.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> result = noDueService.processRequest(999L, Map.of("status", "APPROVED", "remarks", "Cleared"), adminUser, "192.168.1.1");
        assertTrue((Boolean) result.get("success"));
        assertEquals("APPROVED", result.get("status"));
        assertEquals("APPROVED", pendingReq.getStatus());
        assertEquals("Cleared", pendingReq.getRemarks());
        assertEquals(adminUser, pendingReq.getApprovedBy());
        assertNotNull(pendingReq.getApprovedAt());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }
}
