package com.university.erp.service;

import com.university.erp.dto.FacultySubstitutionDto;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.util.ErpException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FacultySubstitutionServiceTest {

    @Mock
    private FacultySubstitutionRepository substitutionRepository;
    @Mock
    private TimetableSlotRepository timetableSlotRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FacultySubjectRepository facultySubjectRepository;
    @Mock
    private FacultyLeaveRequestRepository leaveRequestRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FacultySubstitutionService substitutionService;

    private Department deptCSE;
    private Department deptIT;
    private Subject subjectDSA;
    private User originalFaculty;
    private User candidateFree;
    private User candidateBusy;
    private User candidateOnLeave;
    private User hodUser;
    private TimetableSlot targetSlot;

    @BeforeEach
    void setUp() {
        deptCSE = Department.builder().id(1L).code("CSE").deptName("Computer Science").build();
        deptIT = Department.builder().id(2L).code("IT").deptName("Information Technology").build();

        subjectDSA = Subject.builder().id(101L).subjectCode("CS23314").subjectName("Data Structures").department(deptCSE).build();

        originalFaculty = User.builder()
                .userId(10L)
                .username("prof.sharma")
                .firstName("Sharma")
                .lastName("K")
                .role(Role.builder().roleName(Role.UserRole.FACULTY).build())
                .department(deptCSE)
                .build();

        candidateFree = User.builder()
                .userId(20L)
                .username("dr.priya")
                .firstName("Priya")
                .lastName("R")
                .role(Role.builder().roleName(Role.UserRole.FACULTY).build())
                .department(deptCSE)
                .build();

        candidateBusy = User.builder()
                .userId(30L)
                .username("prof.karthik")
                .firstName("Karthik")
                .lastName("M")
                .role(Role.builder().roleName(Role.UserRole.FACULTY).build())
                .department(deptCSE)
                .build();

        candidateOnLeave = User.builder()
                .userId(40L)
                .username("prof.anitha")
                .firstName("Anitha")
                .lastName("S")
                .role(Role.builder().roleName(Role.UserRole.FACULTY).build())
                .department(deptIT)
                .build();

        hodUser = User.builder()
                .userId(99L)
                .username("hod.cse")
                .firstName("HOD")
                .lastName("CSE")
                .role(Role.builder().roleName(Role.UserRole.HOD).build())
                .department(deptCSE)
                .build();

        targetSlot = TimetableSlot.builder()
                .id(501L)
                .dayOfWeek("MONDAY")
                .startTime("09:00:00")
                .endTime("09:50:00")
                .section("CSE-A")
                .subject(subjectDSA)
                .faculty(originalFaculty)
                .department(deptCSE)
                .build();

        when(leaveRequestRepository.findByFacultyIdAndStatus(anyString(), eq("APPROVED")))
                .thenReturn(Collections.emptyList());
    }

    @Test
    void testFindEligibleSubstitutes_SuccessWithClashAndLeaveFiltering() {
        // 2026-11-02 is a MONDAY
        LocalDate subDate = LocalDate.of(2026, 11, 2);

        when(timetableSlotRepository.findById(501L)).thenReturn(Optional.of(targetSlot));
        when(userRepository.findByRole_RoleNameAndDepartment_Id(eq(Role.UserRole.FACULTY), eq(1L)))
                .thenReturn(List.of(originalFaculty, candidateFree, candidateBusy, candidateOnLeave));

        // candidateBusy has a timetable clash at 09:00:00
        TimetableSlot clashSlot = TimetableSlot.builder()
                .id(701L)
                .dayOfWeek("MONDAY")
                .startTime("09:00:00")
                .endTime("09:50:00")
                .section("CSE-B")
                .faculty(candidateBusy)
                .department(deptCSE)
                .build();
        when(timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(eq(30L), eq("MONDAY"), eq("09:00:00")))
                .thenReturn(List.of(clashSlot));
        when(timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(eq(20L), eq("MONDAY"), eq("09:00:00")))
                .thenReturn(Collections.emptyList());
        when(timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(eq(40L), eq("MONDAY"), eq("09:00:00")))
                .thenReturn(Collections.emptyList());

        // candidateOnLeave has an approved leave
        FacultyLeaveRequest leave = new FacultyLeaveRequest();
        leave.setId(901L);
        leave.setFacultyId("40");
        leave.setStartDate(subDate.minusDays(1).toString());
        leave.setEndDate(subDate.plusDays(1).toString());
        leave.setStatus("APPROVED");

        when(leaveRequestRepository.findByFacultyIdAndStatus(eq("40"), eq("APPROVED")))
                .thenReturn(List.of(leave));

        // Weekly workloads
        when(timetableSlotRepository.findByFaculty_UserId(20L)).thenReturn(List.of(targetSlot));
        when(timetableSlotRepository.findByFaculty_UserId(30L)).thenReturn(List.of(targetSlot, clashSlot));
        when(timetableSlotRepository.findByFaculty_UserId(40L)).thenReturn(Collections.emptyList());

        List<FacultySubstitutionDto.Candidate> candidates = substitutionService.findEligibleSubstitutes(501L, subDate, originalFaculty);

        assertNotNull(candidates);
        assertFalse(candidates.isEmpty());

        // candidateFree should be AVAILABLE
        Optional<FacultySubstitutionDto.Candidate> freeCandidateOpt = candidates.stream()
                .filter(c -> c.getFacultyId().equals(20L))
                .findFirst();
        assertTrue(freeCandidateOpt.isPresent());
        assertEquals("AVAILABLE", freeCandidateOpt.get().getAvailabilityStatus());

        // candidateBusy should be BUSY_TEACHING
        Optional<FacultySubstitutionDto.Candidate> busyCandidateOpt = candidates.stream()
                .filter(c -> c.getFacultyId().equals(30L))
                .findFirst();
        assertTrue(busyCandidateOpt.isPresent());
        assertEquals("BUSY_TEACHING", busyCandidateOpt.get().getAvailabilityStatus());
        assertNotNull(busyCandidateOpt.get().getConflictReason());

        // candidateOnLeave should be ON_LEAVE
        Optional<FacultySubstitutionDto.Candidate> leaveCandidateOpt = candidates.stream()
                .filter(c -> c.getFacultyId().equals(40L))
                .findFirst();
        assertTrue(leaveCandidateOpt.isPresent());
        assertEquals("ON_LEAVE", leaveCandidateOpt.get().getAvailabilityStatus());

        // original faculty should NOT be in the candidate list
        assertFalse(candidates.stream().anyMatch(c -> c.getFacultyId().equals(10L)));
    }

    @Test
    void testRequestSubstitution_Success() {
        LocalDate subDate = LocalDate.now().plusDays(1);
        FacultySubstitutionDto.Request req = FacultySubstitutionDto.Request.builder()
                .timetableSlotId(501L)
                .substituteFacultyId(20L)
                .substitutionDate(subDate)
                .reason("Attending IEEE conference")
                .build();

        when(timetableSlotRepository.findById(501L)).thenReturn(Optional.of(targetSlot));
        when(userRepository.findById(20L)).thenReturn(Optional.of(candidateFree));
        when(substitutionRepository.findByTimetableSlot_IdAndSubstitutionDateAndStatusIn(eq(501L), eq(subDate), anyCollection()))
                .thenReturn(Collections.emptyList());
        when(timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(eq(20L), eq("MONDAY"), eq("09:00:00")))
                .thenReturn(Collections.emptyList());

        when(substitutionRepository.save(any(FacultySubstitution.class))).thenAnswer(inv -> {
            FacultySubstitution fs = inv.getArgument(0);
            fs.setId(1001L);
            return fs;
        });

        FacultySubstitutionDto.Response resp = substitutionService.requestSubstitution(req, originalFaculty);

        assertNotNull(resp);
        assertEquals("PENDING_APPROVAL", resp.getStatus());
        assertEquals("Sharma K", resp.getOriginalFacultyName());
        assertEquals("Priya R", resp.getSubstituteFacultyName());
        assertEquals(501L, resp.getTimetableSlotId());

        verify(notificationService, atLeastOnce()).sendUserNotification(any(), any());
    }

    @Test
    void testRequestSubstitution_ThrowsOnClashingSubstitute() {
        LocalDate subDate = LocalDate.now().plusDays(1);
        FacultySubstitutionDto.Request req = FacultySubstitutionDto.Request.builder()
                .timetableSlotId(501L)
                .substituteFacultyId(30L)
                .substitutionDate(subDate)
                .reason("Personal work")
                .build();

        when(timetableSlotRepository.findById(501L)).thenReturn(Optional.of(targetSlot));
        when(userRepository.findById(30L)).thenReturn(Optional.of(candidateBusy));
        when(substitutionRepository.findByTimetableSlot_IdAndSubstitutionDateAndStatusIn(eq(501L), eq(subDate), anyCollection()))
                .thenReturn(Collections.emptyList());

        TimetableSlot clash = TimetableSlot.builder().id(702L).dayOfWeek("MONDAY").startTime("09:00:00").endTime("09:50:00").build();
        when(timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(eq(30L), eq("MONDAY"), eq("09:00:00")))
                .thenReturn(List.of(clash));

        assertThrows(ErpException.class, () -> substitutionService.requestSubstitution(req, originalFaculty));
    }

    @Test
    void testApproveSubstitution_ByHodSuccess() {
        LocalDate subDate = LocalDate.now().plusDays(1);
        FacultySubstitution sub = FacultySubstitution.builder()
                .id(1001L)
                .originalFaculty(originalFaculty)
                .substituteFaculty(candidateFree)
                .timetableSlot(targetSlot)
                .substitutionDate(subDate)
                .status("PENDING_APPROVAL")
                .requestedBy(originalFaculty)
                .requestedAt(LocalDateTime.now())
                .build();

        when(substitutionRepository.findById(1001L)).thenReturn(Optional.of(sub));
        when(timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(eq(20L), eq("MONDAY"), eq("09:00:00")))
                .thenReturn(Collections.emptyList());
        when(substitutionRepository.save(any(FacultySubstitution.class))).thenAnswer(inv -> inv.getArgument(0));

        FacultySubstitutionDto.Response resp = substitutionService.approveSubstitution(1001L, "Approved by HOD", hodUser);

        assertNotNull(resp);
        assertEquals("APPROVED", resp.getStatus());
        assertEquals("Approved by HOD", resp.getActionRemarks());
        assertEquals("hod.cse", resp.getActionedByName());

        verify(notificationService, atLeastOnce()).sendUserNotification(any(), any());
    }

    @Test
    void testRejectSubstitution_Success() {
        LocalDate subDate = LocalDate.now().plusDays(1);
        FacultySubstitution sub = FacultySubstitution.builder()
                .id(1002L)
                .originalFaculty(originalFaculty)
                .substituteFaculty(candidateFree)
                .timetableSlot(targetSlot)
                .substitutionDate(subDate)
                .status("PENDING_APPROVAL")
                .requestedBy(originalFaculty)
                .requestedAt(LocalDateTime.now())
                .build();

        when(substitutionRepository.findById(1002L)).thenReturn(Optional.of(sub));
        when(substitutionRepository.save(any(FacultySubstitution.class))).thenAnswer(inv -> inv.getArgument(0));

        FacultySubstitutionDto.Response resp = substitutionService.rejectSubstitution(1002L, "Both faculty are needed for audit", hodUser);

        assertNotNull(resp);
        assertEquals("REJECTED", resp.getStatus());
        assertEquals("Both faculty are needed for audit", resp.getActionRemarks());
    }

    @Test
    void testCancelSubstitution_ByOriginalRequester() {
        LocalDate subDate = LocalDate.now().plusDays(2);
        FacultySubstitution sub = FacultySubstitution.builder()
                .id(1003L)
                .originalFaculty(originalFaculty)
                .substituteFaculty(candidateFree)
                .timetableSlot(targetSlot)
                .substitutionDate(subDate)
                .status("PENDING_APPROVAL")
                .requestedBy(originalFaculty)
                .requestedAt(LocalDateTime.now())
                .build();

        when(substitutionRepository.findById(1003L)).thenReturn(Optional.of(sub));
        when(substitutionRepository.save(any(FacultySubstitution.class))).thenAnswer(inv -> inv.getArgument(0));

        FacultySubstitutionDto.Response resp = substitutionService.cancelSubstitution(1003L, originalFaculty);

        assertNotNull(resp);
        assertEquals("CANCELLED", resp.getStatus());
    }
}
