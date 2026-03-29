package com.university.erp.service;

import com.university.erp.model.*;
import com.university.erp.util.ErpException;
import com.university.erp.repository.ClubRepository;
import com.university.erp.repository.StudentClubMembershipRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;
    private final StudentClubMembershipRepository membershipRepository;
    private final StudentRepository studentRepository;
    private final StudentProfileService studentProfileService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllClubsWithMemberCount() {
        return clubRepository.findAllByOrderByClubNameAsc()
                .stream()
                .map(this::toClubCard)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentInvolvement(Long studentId) {
        return membershipRepository.findByStudent_IdOrderByJoinedDateDesc(studentId)
                .stream()
                .map(this::toMembershipCard)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentInvolvementForLoggedInStudent(Long userId) {
        Student student = studentProfileService.getByUserId(userId);
        return getStudentInvolvement(student.getId());
    }

    @Transactional
    public Map<String, Object> createClub(Map<String, Object> payload) {
        String clubName = normalize(payload.get("clubName"));
        if (clubName.isBlank()) {
            throw new ErpException.InvalidOperationException("Club name is required");
        }
        if (clubRepository.existsByClubNameIgnoreCase(clubName)) {
            throw new ErpException.InvalidOperationException("Club already exists");
        }

        Club club = Club.builder()
                .clubName(clubName)
                .description(normalize(payload.get("description")))
                .category(normalize(payload.get("category")).isBlank() ? "general" : normalize(payload.get("category")))
                .contactEmail(normalize(payload.get("contactEmail")))
                .status(normalize(payload.get("status")).isBlank() ? "active" : normalize(payload.get("status")).toLowerCase())
                .build();

        Long coordinatorId = asLong(payload.get("facultyCoordinatorId"));
        if (coordinatorId != null) {
            club.setFacultyCoordinator(requireFacultyUser(coordinatorId));
        }

        return toClubCard(clubRepository.save(club));
    }

    @Transactional
    public Map<String, Object> updateClub(Long clubId, Map<String, Object> payload) {
        Club club = requireClub(clubId);
        String name = normalize(payload.get("clubName"));
        if (!name.isBlank() && !name.equalsIgnoreCase(club.getClubName()) && clubRepository.existsByClubNameIgnoreCase(name)) {
            throw new ErpException.InvalidOperationException("Club name already exists");
        }
        if (!name.isBlank()) club.setClubName(name);

        String description = normalize(payload.get("description"));
        if (!description.isBlank()) club.setDescription(description);

        String category = normalize(payload.get("category"));
        if (!category.isBlank()) club.setCategory(category);

        String contactEmail = normalize(payload.get("contactEmail"));
        if (!contactEmail.isBlank()) club.setContactEmail(contactEmail);

        String status = normalize(payload.get("status"));
        if (!status.isBlank()) club.setStatus(status.toLowerCase());

        if (payload.containsKey("facultyCoordinatorId")) {
            Long coordinatorId = asLong(payload.get("facultyCoordinatorId"));
            club.setFacultyCoordinator(coordinatorId == null ? null : requireFacultyUser(coordinatorId));
        }

        return toClubCard(clubRepository.save(club));
    }

    @Transactional
    public Map<String, Object> setClubStatus(Long clubId, String status) {
        Club club = requireClub(clubId);
        club.setStatus(normalize(status).isBlank() ? "inactive" : normalize(status).toLowerCase());
        return toClubCard(clubRepository.save(club));
    }

    @Transactional
    public Map<String, Object> assignCoordinator(Long clubId, Long facultyUserId) {
        Club club = requireClub(clubId);
        club.setFacultyCoordinator(requireFacultyUser(facultyUserId));
        return toClubCard(clubRepository.save(club));
    }

    @Transactional
    public Map<String, Object> addMembership(Map<String, Object> payload, User actor) {
        Long studentId = asLong(payload.get("studentId"));
        String studentIdNumber = normalize(payload.get("studentIdNumber"));
        Long clubId = asLong(payload.get("clubId"));
        if ((studentId == null && studentIdNumber.isBlank()) || clubId == null) {
            throw new ErpException.InvalidOperationException("clubId and (studentId or studentIdNumber) are required");
        }

        Student student;
        if (studentId != null) {
            student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"));
        } else {
            student = studentRepository.findByStudentIdNumber(studentIdNumber)
                    .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student not found"))
                    ;
        }
        Club club = requireClub(clubId);

        enforceMembershipWriteAccess(actor, club, student);

        Optional<StudentClubMembership> existing = membershipRepository.findByStudent_IdAndClub_ClubId(studentId, clubId);
        StudentClubMembership membership = existing.orElseGet(StudentClubMembership::new);
        membership.setStudent(student);
        membership.setClub(club);
        String requestedRole = normalize(payload.get("roleType"));
        if (actor.getRole().getRoleName() == Role.UserRole.STUDENT) {
            requestedRole = "member";
        }
        membership.setRoleType(requestedRole.isBlank() ? "member" : requestedRole);
        membership.setJoinedDate(asDate(payload.get("joinedDate"), LocalDate.now()));
        String status = normalize(payload.get("status"));
        if (actor.getRole().getRoleName() == Role.UserRole.STUDENT) {
            status = "active";
        }
        membership.setStatus(status.isBlank() ? "active" : status.toLowerCase());

        return toMembershipCard(membershipRepository.save(membership));
    }

    @Transactional
    public Map<String, Object> updateMembership(Long membershipId, Map<String, Object> payload, User actor) {
        StudentClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Membership not found"));

        enforceMembershipWriteAccess(actor, membership.getClub(), membership.getStudent());

        String roleType = normalize(payload.get("roleType"));
        if (!roleType.isBlank()) membership.setRoleType(roleType);

        String status = normalize(payload.get("status"));
        if (!status.isBlank()) membership.setStatus(status.toLowerCase());

        LocalDate joinedDate = asDate(payload.get("joinedDate"), null);
        if (joinedDate != null) membership.setJoinedDate(joinedDate);

        return toMembershipCard(membershipRepository.save(membership));
    }

    @Transactional
    public void deactivateMembership(Long membershipId, User actor) {
        StudentClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Membership not found"));
        enforceMembershipWriteAccess(actor, membership.getClub(), membership.getStudent());
        membership.setStatus("inactive");
        membershipRepository.save(membership);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClubMembers(Long clubId, User actor) {
        Club club = requireClub(clubId);
        if (actor.getRole().getRoleName() == Role.UserRole.FACULTY) {
            if (club.getFacultyCoordinator() == null || !Objects.equals(club.getFacultyCoordinator().getId(), actor.getId())) {
                throw new AccessDeniedException("Faculty can only view members of clubs they coordinate");
            }
        }
        if (actor.getRole().getRoleName() == Role.UserRole.HOD && actor.getDepartment() != null) {
            List<Map<String, Object>> scoped = membershipRepository.findByClub_ClubIdOrderByJoinedDateDesc(clubId)
                    .stream()
                    .filter(m -> m.getStudent().getDepartment() != null
                            && Objects.equals(m.getStudent().getDepartment().getId(), actor.getDepartment().getId()))
                    .map(this::toMembershipCard)
                    .toList();
            return scoped;
        }
        return membershipRepository.findByClub_ClubIdOrderByJoinedDateDesc(clubId)
                .stream()
                .map(this::toMembershipCard)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics(User actor) {
        Map<String, Object> response = new LinkedHashMap<>();

        List<Object[]> byDept = membershipRepository.participationByDepartment();
        List<Object[]> byYear = membershipRepository.participationByYear();

        if (actor.getRole().getRoleName() == Role.UserRole.HOD && actor.getDepartment() != null) {
            String deptCode = actor.getDepartment().getCode();
            byDept = byDept.stream().filter(row -> Objects.equals(row[0], deptCode)).toList();
        }

        response.put("participationByDepartment", byDept.stream()
                .map(row -> Map.of("department", row[0], "count", row[1]))
                .toList());
        response.put("participationByYear", byYear.stream()
                .map(row -> Map.of("year", row[0], "count", row[1]))
                .toList());
        response.put("activeMemberships", membershipRepository.countByStatusIgnoreCase("active"));
        response.put("inactiveMemberships", membershipRepository.countByStatusIgnoreCase("inactive"));

        long activeClubs = clubRepository.findAll().stream().filter(c -> "active".equalsIgnoreCase(c.getStatus())).count();
        response.put("activeClubs", activeClubs);
        response.put("inactiveClubs", Math.max(0, clubRepository.count() - activeClubs));

        List<Map<String, Object>> coreMembers = membershipRepository.findByStatusIgnoreCaseOrderByJoinedDateDesc("active")
                .stream()
                .filter(m -> {
                    String role = Optional.ofNullable(m.getRoleType()).orElse("").toLowerCase();
                    return role.contains("core") || role.contains("president") || role.contains("secretary") || role.contains("coordinator");
                })
                .limit(50)
                .map(this::toMembershipCard)
                .toList();
        response.put("coreMembers", coreMembers);
        response.put("studentEngagementRate", clubRepository.count() == 0 ? 0
                : Math.round((membershipRepository.countByStatusIgnoreCase("active") * 1000.0) / Math.max(studentRepository.count(), 1)) / 10.0);
        return response;
    }

    @Transactional(readOnly = true)
    public String exportMembersCsv(Long clubId, User actor) {
        List<Map<String, Object>> members = getClubMembers(clubId, actor);
        StringBuilder sb = new StringBuilder();
        sb.append("membership_id,student_id,student_name,department,club_name,role_type,joined_date,status\n");
        for (Map<String, Object> m : members) {
            sb.append(m.get("membershipId")).append(",")
                    .append(m.get("studentId")).append(",")
                    .append(csv(m.get("studentName"))).append(",")
                    .append(csv(m.get("department"))).append(",")
                    .append(csv(m.get("clubName"))).append(",")
                    .append(csv(m.get("roleType"))).append(",")
                    .append(m.get("joinedDate")).append(",")
                    .append(m.get("status")).append("\n");
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFacultyCoordinatorOptions(User actor) {
        List<User> facultyUsers;
        if (actor.getRole().getRoleName() == Role.UserRole.HOD && actor.getDepartment() != null) {
            facultyUsers = userRepository.findByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, actor.getDepartment().getId());
        } else {
            facultyUsers = userRepository.findByRole_RoleName(Role.UserRole.FACULTY);
        }
        return facultyUsers.stream()
                .map(faculty -> {
                    String name = (Optional.ofNullable(faculty.getFirstName()).orElse("")
                            + " " + Optional.ofNullable(faculty.getLastName()).orElse("")).trim();
                    if (name.isBlank()) name = faculty.getEmail();
                    String deptCode = faculty.getDepartment() != null ? faculty.getDepartment().getCode() : "";
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", faculty.getId());
                    map.put("name", name);
                    map.put("email", faculty.getEmail());
                    map.put("department", deptCode);
                    return map;
                })
                .sorted(Comparator.comparing(m -> String.valueOf(m.get("name")), String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private void enforceMembershipWriteAccess(User actor, Club club, Student student) {
        Role.UserRole role = actor.getRole().getRoleName();
        if (role == Role.UserRole.ADMIN) return;
        if (role == Role.UserRole.FACULTY) {
            if (club.getFacultyCoordinator() == null || !Objects.equals(club.getFacultyCoordinator().getId(), actor.getId())) {
                throw new AccessDeniedException("Faculty can only manage clubs they coordinate");
            }
            return;
        }
        if (role == Role.UserRole.HOD) {
            if (actor.getDepartment() == null || student.getDepartment() == null
                    || !Objects.equals(actor.getDepartment().getId(), student.getDepartment().getId())) {
                throw new AccessDeniedException("HOD can only manage memberships for their department");
            }
            return;
        }
        if (role == Role.UserRole.STUDENT) {
            Student self = studentProfileService.getByUserId(actor.getId());
            if (!Objects.equals(self.getId(), student.getId())) {
                throw new AccessDeniedException("Students can only request memberships for themselves");
            }
            return;
        }
        throw new AccessDeniedException("Not authorized to modify club memberships");
    }

    private Club requireClub(Long clubId) {
        return clubRepository.findByClubId(clubId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Club not found"));
    }

    private User requireFacultyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Coordinator user not found"));
        if (user.getRole() == null || user.getRole().getRoleName() != Role.UserRole.FACULTY) {
            throw new ErpException.InvalidOperationException("Coordinator must be a faculty user");
        }
        return user;
    }

    private Map<String, Object> toClubCard(Club club) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("clubId", club.getClubId());
        map.put("clubName", club.getClubName());
        map.put("description", Optional.ofNullable(club.getDescription()).orElse(""));
        map.put("category", Optional.ofNullable(club.getCategory()).orElse("general"));
        map.put("facultyCoordinator", coordinatorName(club.getFacultyCoordinator()));
        map.put("facultyCoordinatorId", club.getFacultyCoordinator() != null ? club.getFacultyCoordinator().getId() : null);
        map.put("contactEmail", Optional.ofNullable(club.getContactEmail()).orElse(""));
        map.put("status", Optional.ofNullable(club.getStatus()).orElse("inactive"));
        map.put("memberCount", membershipRepository.countByClub_ClubIdAndStatusIgnoreCase(club.getClubId(), "active"));
        return map;
    }

    private Map<String, Object> toMembershipCard(StudentClubMembership membership) {
        String studentName = "";
        if (membership.getStudent() != null && membership.getStudent().getUser() != null) {
            studentName = (Optional.ofNullable(membership.getStudent().getUser().getFirstName()).orElse("")
                    + " " + Optional.ofNullable(membership.getStudent().getUser().getLastName()).orElse("")).trim();
        }
        String dept = membership.getStudent() != null && membership.getStudent().getDepartment() != null
                ? membership.getStudent().getDepartment().getCode()
                : "";
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("membershipId", membership.getMembershipId());
        map.put("studentId", membership.getStudent() != null ? membership.getStudent().getId() : null);
        map.put("studentName", studentName);
        map.put("department", dept);
        map.put("clubId", membership.getClub() != null ? membership.getClub().getClubId() : null);
        map.put("clubName", membership.getClub() != null ? membership.getClub().getClubName() : "");
        map.put("clubDescription", membership.getClub() != null ? Optional.ofNullable(membership.getClub().getDescription()).orElse("") : "");
        map.put("roleType", Optional.ofNullable(membership.getRoleType()).orElse("member"));
        map.put("joinedDate", membership.getJoinedDate());
        map.put("status", Optional.ofNullable(membership.getStatus()).orElse("inactive"));
        map.put("facultyCoordinator", membership.getClub() != null ? coordinatorName(membership.getClub().getFacultyCoordinator()) : "");
        return map;
    }

    private String coordinatorName(User coordinator) {
        if (coordinator == null) return "Not Assigned";
        String fullName = (Optional.ofNullable(coordinator.getFirstName()).orElse("")
                + " " + Optional.ofNullable(coordinator.getLastName()).orElse("")).trim();
        return fullName.isBlank() ? coordinator.getEmail() : fullName;
    }

    private static Long asLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String normalize(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static LocalDate asDate(Object value, LocalDate fallback) {
        if (value == null) return fallback;
        String s = normalize(value);
        if (s.isBlank()) return fallback;
        try {
            return LocalDate.parse(s);
        } catch (Exception ex) {
            return fallback;
        }
    }

    private static String csv(Object value) {
        String raw = value == null ? "" : String.valueOf(value);
        String escaped = raw.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
