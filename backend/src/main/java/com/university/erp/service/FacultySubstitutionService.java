package com.university.erp.service;

import com.university.erp.dto.FacultySubstitutionDto;
import com.university.erp.model.*;
import com.university.erp.repository.FacultyLeaveRequestRepository;
import com.university.erp.repository.FacultySubstitutionRepository;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.util.ErpException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacultySubstitutionService {

    private final FacultySubstitutionRepository substitutionRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final UserRepository userRepository;
    private final FacultyLeaveRequestRepository leaveRequestRepository;
    private final NotificationService notificationService;

    /**
     * Evaluates all candidate faculty in the department (or institution) to identify eligible substitutes
     * for a given timetable slot on a specific date, checking teaching conflicts, leaves, and workload.
     */
    @Transactional(readOnly = true)
    public List<FacultySubstitutionDto.Candidate> findEligibleSubstitutes(Long slotId, LocalDate date, User currentUser) {
        if (slotId == null) {
            throw new ErpException.ValidationException("Timetable slot ID is required.");
        }
        if (date == null) {
            throw new ErpException.ValidationException("Substitution date is required.");
        }

        TimetableSlot slot = timetableSlotRepository.findById(slotId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Timetable slot not found with ID: " + slotId));

        // Check if day of week aligns with slot day
        String expectedDay = date.getDayOfWeek().name();
        if (!expectedDay.equalsIgnoreCase(slot.getDayOfWeek())) {
            log.warn("Requested date {} is a {}, but slot {} is on a {}", date, expectedDay, slotId, slot.getDayOfWeek());
        }

        Long deptId = slot.getDepartment() != null ? slot.getDepartment().getId() : null;
        List<User> candidates;
        if (deptId != null) {
            candidates = userRepository.findByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, deptId);
        } else {
            candidates = userRepository.findByRole_RoleName(Role.UserRole.FACULTY);
        }

        // If department pool is empty, fall back to all faculty
        if (candidates.isEmpty()) {
            candidates = userRepository.findByRole_RoleName(Role.UserRole.FACULTY);
        }

        Long originalFacultyId = slot.getFaculty() != null ? slot.getFaculty().getUserId() : null;

        List<FacultySubstitutionDto.Candidate> result = new ArrayList<>();

        for (User candidate : candidates) {
            if (candidate.getUserId().equals(originalFacultyId)) {
                continue; // Cannot substitute self
            }

            // 1. Check if candidate has a teaching slot at the exact same time
            List<TimetableSlot> clashes = timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(
                    candidate.getUserId(), slot.getDayOfWeek(), slot.getStartTime());
            boolean isTeaching = !clashes.isEmpty();

            // 2. Check if candidate has an approved leave on this date
            boolean onLeave = isFacultyOnLeave(candidate, date);

            // 3. Check if candidate already has an active substitution at this period on this date
            List<FacultySubstitution> existingSubs = substitutionRepository
                    .findBySubstituteFaculty_UserIdAndSubstitutionDateAndStatus(
                            candidate.getUserId(), date, "APPROVED");
            boolean alreadySubstituting = existingSubs.stream().anyMatch(sub ->
                    sub.getTimetableSlot() != null &&
                    sub.getTimetableSlot().getStartTime().equalsIgnoreCase(slot.getStartTime()));

            // 4. Workload calculation (total assigned weekly slots)
            List<TimetableSlot> allSlots = timetableSlotRepository.findByFaculty_UserId(candidate.getUserId());
            int workloadHours = allSlots.size();

            // 5. Subject expertise (has taught this subject or same department)
            boolean isSubjectExpert = (slot.getSubject() != null && allSlots.stream().anyMatch(s ->
                    s.getSubject() != null && s.getSubject().getId().equals(slot.getSubject().getId())))
                    || (deptId != null && candidate.getDepartment() != null && candidate.getDepartment().getId().equals(deptId));

            // Availability status determination
            String status = "AVAILABLE";
            String reason = null;

            if (isTeaching) {
                status = "BUSY_TEACHING";
                TimetableSlot clashSlot = clashes.get(0);
                reason = "Teaching " + (clashSlot.getSubject() != null ? clashSlot.getSubject().getSubjectCode() : "Class")
                        + " in Section " + clashSlot.getSection();
            } else if (onLeave) {
                status = "ON_LEAVE";
                reason = "Approved leave on " + date;
            } else if (alreadySubstituting) {
                status = "ALREADY_SUBSTITUTING";
                reason = "Already assigned as substitute for another period";
            }

            // Match score (70-100 based on availability, expertise, and workload balance)
            int matchScore;
            if (!"AVAILABLE".equals(status)) {
                matchScore = 30;
            } else {
                matchScore = 75;
                if (isSubjectExpert) matchScore += 15;
                if (workloadHours < 14) matchScore += 10; // lower load = better candidate
                else if (workloadHours > 20) matchScore -= 5;
            }

            String fullName = candidate.getFirstName() != null
                    ? (candidate.getFirstName() + " " + (candidate.getLastName() != null ? candidate.getLastName() : "")).trim()
                    : candidate.getUsername();

            String deptCode = candidate.getDepartment() != null ? candidate.getDepartment().getCode() : "RIT";

            result.add(FacultySubstitutionDto.Candidate.builder()
                    .facultyId(candidate.getUserId())
                    .facultyName(fullName)
                    .departmentCode(deptCode)
                    .weeklyWorkloadHours(workloadHours)
                    .isSubjectExpert(isSubjectExpert)
                    .matchScore(Math.min(100, matchScore))
                    .availabilityStatus(status)
                    .conflictReason(reason)
                    .build());
        }

        // Sort: AVAILABLE first, then highest match score, then lowest workload
        result.sort((a, b) -> {
            boolean aAvail = "AVAILABLE".equals(a.getAvailabilityStatus());
            boolean bAvail = "AVAILABLE".equals(b.getAvailabilityStatus());
            if (aAvail != bAvail) return aAvail ? -1 : 1;
            int scoreCmp = Integer.compare(b.getMatchScore(), a.getMatchScore());
            if (scoreCmp != 0) return scoreCmp;
            return Integer.compare(a.getWeeklyWorkloadHours(), b.getWeeklyWorkloadHours());
        });

        return result;
    }

    /**
     * Initiates a substitution request with concurrency protection against double-bookings.
     */
    @Transactional
    public FacultySubstitutionDto.Response requestSubstitution(FacultySubstitutionDto.Request req, User currentUser) {
        if (req.getTimetableSlotId() == null) {
            throw new ErpException.ValidationException("Timetable slot ID is required.");
        }
        if (req.getSubstituteFacultyId() == null) {
            throw new ErpException.ValidationException("Substitute faculty ID is required.");
        }
        if (req.getSubstitutionDate() == null) {
            throw new ErpException.ValidationException("Substitution date is required.");
        }

        TimetableSlot slot = timetableSlotRepository.findById(req.getTimetableSlotId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Timetable slot not found with ID: " + req.getTimetableSlotId()));

        User originalFaculty = slot.getFaculty();
        if (originalFaculty == null) {
            throw new ErpException.ValidationException("No faculty currently assigned to this timetable slot.");
        }

        // Authorization check: User must be the slot's faculty, HOD of the department, or ADMIN
        boolean isAdmin = currentUser.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleName().name());
        boolean isHod = currentUser.getRole() != null && "ROLE_HOD".equalsIgnoreCase(currentUser.getRole().getRoleName().name())
                && currentUser.getDepartment() != null && slot.getDepartment() != null
                && currentUser.getDepartment().getId().equals(slot.getDepartment().getId());
        boolean isAssignedFaculty = currentUser.getUserId().equals(originalFaculty.getUserId());

        if (!isAdmin && !isHod && !isAssignedFaculty) {
            throw new AccessDeniedException("You are not authorized to request substitutions for this faculty slot.");
        }

        User substituteFaculty = userRepository.findById(req.getSubstituteFacultyId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Substitute faculty not found with ID: " + req.getSubstituteFacultyId()));

        if (originalFaculty.getUserId().equals(substituteFaculty.getUserId())) {
            throw new ErpException.ValidationException("Original faculty and substitute faculty cannot be the same person.");
        }

        // Concurrency check: Ensure no active substitution request already exists for this slot on this date
        List<FacultySubstitution> active = substitutionRepository.findByTimetableSlot_IdAndSubstitutionDateAndStatusIn(
                slot.getId(), req.getSubstitutionDate(), List.of("PENDING_APPROVAL", "APPROVED"));
        if (!active.isEmpty()) {
            throw new IllegalStateException("An active substitution is already requested or approved for this class slot on " + req.getSubstitutionDate());
        }

        // Validate substitute is not teaching a clash class
        List<TimetableSlot> clashes = timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(
                substituteFaculty.getUserId(), slot.getDayOfWeek(), slot.getStartTime());
        if (!clashes.isEmpty()) {
            throw new ErpException.ValidationException("Substitute faculty " + substituteFaculty.getUsername() + " has a teaching conflict during " + slot.getStartTime());
        }

        // Validate substitute is not on approved leave
        if (isFacultyOnLeave(substituteFaculty, req.getSubstitutionDate())) {
            throw new ErpException.ValidationException("Substitute faculty " + substituteFaculty.getUsername() + " is on approved leave on " + req.getSubstitutionDate());
        }

        String initialStatus = (isAdmin || isHod) ? "APPROVED" : "PENDING_APPROVAL";

        FacultySubstitution sub = FacultySubstitution.builder()
                .originalFaculty(originalFaculty)
                .substituteFaculty(substituteFaculty)
                .timetableSlot(slot)
                .substitutionDate(req.getSubstitutionDate())
                .reason(req.getReason() != null ? req.getReason().trim() : "Class substitution")
                .status(initialStatus)
                .requestedBy(currentUser)
                .requestedAt(LocalDateTime.now())
                .actionedBy((isAdmin || isHod) ? currentUser : null)
                .actionedAt((isAdmin || isHod) ? LocalDateTime.now() : null)
                .actionRemarks((isAdmin || isHod) ? "Directly authorized by " + currentUser.getUsername() : null)
                .build();

        FacultySubstitution saved = substitutionRepository.save(sub);

        // Send notifications
        String subjectCode = slot.getSubject() != null ? slot.getSubject().getSubjectCode() : "Class";
        if ("APPROVED".equals(initialStatus)) {
            notificationService.sendUserNotification(substituteFaculty,
                    "You have been assigned as substitute for " + subjectCode + " (Section " + slot.getSection() + ") on " + req.getSubstitutionDate());
            notificationService.sendUserNotification(originalFaculty,
                    "Your class substitution for " + subjectCode + " on " + req.getSubstitutionDate() + " was approved.");
        } else {
            notificationService.sendUserNotification(substituteFaculty,
                    "Substitution requested: Cover " + subjectCode + " (Section " + slot.getSection() + ") on " + req.getSubstitutionDate() + ". Awaiting HOD approval.");
        }

        log.info("Faculty substitution #{} created [status: {}] for slot {} on {}", saved.getId(), initialStatus, slot.getId(), req.getSubstitutionDate());
        return toDto(saved);
    }

    /**
     * Approves a pending substitution request. Restricted to HOD or ADMIN.
     */
    @Transactional
    public FacultySubstitutionDto.Response approveSubstitution(Long substitutionId, String remarks, User currentUser) {
        FacultySubstitution sub = substitutionRepository.findById(substitutionId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Substitution request not found with ID: " + substitutionId));

        validateApproverAuthority(sub, currentUser);

        if (!"PENDING_APPROVAL".equalsIgnoreCase(sub.getStatus())) {
            throw new IllegalStateException("Only PENDING_APPROVAL substitutions can be approved. Current status: " + sub.getStatus());
        }

        // Re-check for any newly formed clashes
        TimetableSlot slot = sub.getTimetableSlot();
        if (slot != null && sub.getSubstituteFaculty() != null) {
            List<TimetableSlot> clashes = timetableSlotRepository.findByFaculty_UserIdAndDayOfWeekIgnoreCaseAndStartTime(
                    sub.getSubstituteFaculty().getUserId(), slot.getDayOfWeek(), slot.getStartTime());
            if (!clashes.isEmpty()) {
                throw new IllegalStateException("Cannot approve: Substitute faculty now has a teaching clash at " + slot.getStartTime());
            }
        }

        sub.setStatus("APPROVED");
        sub.setActionedBy(currentUser);
        sub.setActionedAt(LocalDateTime.now());
        sub.setActionRemarks(remarks != null ? remarks.trim() : "Approved by " + currentUser.getUsername());

        FacultySubstitution saved = substitutionRepository.save(sub);

        String subjectCode = slot != null && slot.getSubject() != null ? slot.getSubject().getSubjectCode() : "Class";
        notificationService.sendUserNotification(sub.getSubstituteFaculty(),
                "Substitution APPROVED: You are confirmed to teach " + subjectCode + " on " + sub.getSubstitutionDate());
        notificationService.sendUserNotification(sub.getOriginalFaculty(),
                "Substitution APPROVED: " + sub.getSubstituteFaculty().getUsername() + " will cover your class on " + sub.getSubstitutionDate());

        log.info("Faculty substitution #{} approved by {}", saved.getId(), currentUser.getUsername());
        return toDto(saved);
    }

    /**
     * Rejects a pending substitution request. Restricted to HOD or ADMIN.
     */
    @Transactional
    public FacultySubstitutionDto.Response rejectSubstitution(Long substitutionId, String remarks, User currentUser) {
        FacultySubstitution sub = substitutionRepository.findById(substitutionId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Substitution request not found with ID: " + substitutionId));

        validateApproverAuthority(sub, currentUser);

        if (!"PENDING_APPROVAL".equalsIgnoreCase(sub.getStatus())) {
            throw new IllegalStateException("Only PENDING_APPROVAL substitutions can be rejected. Current status: " + sub.getStatus());
        }

        sub.setStatus("REJECTED");
        sub.setActionedBy(currentUser);
        sub.setActionedAt(LocalDateTime.now());
        sub.setActionRemarks(remarks != null ? remarks.trim() : "Rejected by " + currentUser.getUsername());

        FacultySubstitution saved = substitutionRepository.save(sub);

        notificationService.sendUserNotification(sub.getOriginalFaculty(),
                "Substitution request for " + sub.getSubstitutionDate() + " was REJECTED: " + sub.getActionRemarks());

        log.info("Faculty substitution #{} rejected by {}", saved.getId(), currentUser.getUsername());
        return toDto(saved);
    }

    /**
     * Cancels a pending substitution request. Can be executed by the requester or original faculty.
     */
    @Transactional
    public FacultySubstitutionDto.Response cancelSubstitution(Long substitutionId, User currentUser) {
        FacultySubstitution sub = substitutionRepository.findById(substitutionId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Substitution request not found with ID: " + substitutionId));

        boolean isRequester = sub.getRequestedBy() != null && sub.getRequestedBy().getUserId().equals(currentUser.getUserId());
        boolean isOriginal = sub.getOriginalFaculty() != null && sub.getOriginalFaculty().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = (currentUser.getAuthorities() != null && currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
                || (currentUser.getRole() != null && ("ROLE_ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleName().name()) || currentUser.getRole().getRoleName() == Role.UserRole.ADMIN));

        if (!isRequester && !isOriginal && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to cancel this substitution request.");
        }

        if (!"PENDING_APPROVAL".equalsIgnoreCase(sub.getStatus())) {
            throw new IllegalStateException("Only PENDING_APPROVAL substitutions can be cancelled. Current status: " + sub.getStatus());
        }

        sub.setStatus("CANCELLED");
        sub.setActionedBy(currentUser);
        sub.setActionedAt(LocalDateTime.now());
        sub.setActionRemarks("Cancelled by " + currentUser.getUsername());

        FacultySubstitution saved = substitutionRepository.save(sub);
        log.info("Faculty substitution #{} cancelled by {}", saved.getId(), currentUser.getUsername());
        return toDto(saved);
    }

    /**
     * Retrieves all substitutions where current user is involved as original faculty, substitute, or requester.
     */
    @Transactional(readOnly = true)
    public List<FacultySubstitutionDto.Response> getMySubstitutions(User currentUser) {
        return substitutionRepository.findAllRelevantForUser(currentUser.getUserId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all pending substitutions for HOD (in department) or ADMIN (institution-wide).
     */
    @Transactional(readOnly = true)
    public List<FacultySubstitutionDto.Response> getPendingSubstitutions(User currentUser) {
        boolean isAdmin = currentUser.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleName().name());
        boolean isHod = currentUser.getRole() != null && "ROLE_HOD".equalsIgnoreCase(currentUser.getRole().getRoleName().name());

        if (isAdmin) {
            return substitutionRepository.findByStatusOrderBySubstitutionDateAscRequestedAtAsc("PENDING_APPROVAL")
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        if (isHod && currentUser.getDepartment() != null) {
            return substitutionRepository.findPendingByDepartment(currentUser.getDepartment().getId())
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    /**
     * Returns approved substitutions for a given date for timetable resolution.
     */
    @Transactional(readOnly = true)
    public List<FacultySubstitution> getApprovedSubstitutionsForDate(LocalDate date, Long facultyId) {
        return substitutionRepository.findApprovedForFacultyOnDate(facultyId, date);
    }

    private boolean isFacultyOnLeave(User faculty, LocalDate date) {
        if (faculty == null) return false;
        String facultyIdStr = String.valueOf(faculty.getUserId());
        String username = faculty.getUsername();

        List<FacultyLeaveRequest> leaves = leaveRequestRepository.findByFacultyIdAndStatus(facultyIdStr, "APPROVED");
        if (leaves.isEmpty() && username != null) {
            leaves = leaveRequestRepository.findByFacultyIdAndStatus(username, "APPROVED");
        }

        for (FacultyLeaveRequest leave : leaves) {
            if (leave.getStartDate() != null && leave.getEndDate() != null) {
                try {
                    LocalDate start = LocalDate.parse(leave.getStartDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                    LocalDate end = LocalDate.parse(leave.getEndDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                    if (!date.isBefore(start) && !date.isAfter(end)) {
                        return true;
                    }
                } catch (Exception _e) {
                    /* ignore date parse failures */
                }
            }
        }
        return false;
    }

    private void validateApproverAuthority(FacultySubstitution sub, User currentUser) {
        boolean isAdmin = (currentUser.getAuthorities() != null && currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
                || (currentUser.getRole() != null && ("ROLE_ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleName().name()) || currentUser.getRole().getRoleName() == Role.UserRole.ADMIN));
        boolean isHod = (currentUser.getAuthorities() != null && currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HOD")))
                || (currentUser.getRole() != null && ("ROLE_HOD".equalsIgnoreCase(currentUser.getRole().getRoleName().name()) || currentUser.getRole().getRoleName() == Role.UserRole.HOD));

        if (!isAdmin && !isHod) {
            throw new AccessDeniedException("Only HOD or Admin can approve or reject substitution requests.");
        }

        if (isHod && !isAdmin) {
            Long userDeptId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
            Long slotDeptId = sub.getTimetableSlot() != null && sub.getTimetableSlot().getDepartment() != null
                    ? sub.getTimetableSlot().getDepartment().getId()
                    : null;
            if (userDeptId != null && slotDeptId != null && !userDeptId.equals(slotDeptId)) {
                throw new AccessDeniedException("HODs can only approve substitutions within their own department.");
            }
        }
    }

    public FacultySubstitutionDto.Response toDto(FacultySubstitution sub) {
        TimetableSlot slot = sub.getTimetableSlot();
        User orig = sub.getOriginalFaculty();
        User subst = sub.getSubstituteFaculty();
        User reqBy = sub.getRequestedBy();
        User actBy = sub.getActionedBy();

        String origName = orig != null
                ? (orig.getFirstName() != null ? orig.getFirstName() + " " + (orig.getLastName() != null ? orig.getLastName() : "") : orig.getUsername()).trim()
                : "Unknown";

        String substName = subst != null
                ? (subst.getFirstName() != null ? subst.getFirstName() + " " + (subst.getLastName() != null ? subst.getLastName() : "") : subst.getUsername()).trim()
                : "Unknown";

        String reqByName = reqBy != null ? reqBy.getUsername() : "System";
        String actByName = actBy != null ? actBy.getUsername() : null;

        return FacultySubstitutionDto.Response.builder()
                .id(sub.getId())
                .originalFacultyId(orig != null ? orig.getUserId() : null)
                .originalFacultyName(origName)
                .substituteFacultyId(subst != null ? subst.getUserId() : null)
                .substituteFacultyName(substName)
                .timetableSlotId(slot != null ? slot.getId() : null)
                .subjectCode(slot != null && slot.getSubject() != null ? slot.getSubject().getSubjectCode() : "N/A")
                .subjectName(slot != null && slot.getSubject() != null ? slot.getSubject().getSubjectName() : "N/A")
                .section(slot != null ? slot.getSection() : "N/A")
                .dayOfWeek(slot != null ? slot.getDayOfWeek() : "N/A")
                .startTime(slot != null ? slot.getStartTime() : "N/A")
                .endTime(slot != null ? slot.getEndTime() : "N/A")
                .classroomName(slot != null && slot.getClassroom() != null ? slot.getClassroom().getName() : "N/A")
                .substitutionDate(sub.getSubstitutionDate())
                .reason(sub.getReason())
                .status(sub.getStatus())
                .requestedByName(reqByName)
                .requestedAt(sub.getRequestedAt())
                .actionedByName(actByName)
                .actionedAt(sub.getActionedAt())
                .actionRemarks(sub.getActionRemarks())
                .build();
    }
}
