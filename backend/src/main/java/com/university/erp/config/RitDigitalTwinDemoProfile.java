package com.university.erp.config;

import com.university.erp.model.AssetInventory;
import com.university.erp.model.Building;
import com.university.erp.model.Classroom;
import com.university.erp.model.Department;
import com.university.erp.model.Parent;
import com.university.erp.model.Role;
import com.university.erp.model.Student;
import com.university.erp.model.Subject;
import com.university.erp.model.TimetableSlot;
import com.university.erp.model.User;
import com.university.erp.repository.AssetInventoryRepository;
import com.university.erp.repository.BuildingRepository;
import com.university.erp.repository.ClassroomRepository;
import com.university.erp.repository.DepartmentRepository;
import com.university.erp.repository.ParentRepository;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.repository.SubjectRepository;
import com.university.erp.repository.TimetableSlotRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.security.OneTimeTokens;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

/**
 * Local/dev only. Creates the smallest labeled DEMO dataset that lets RIT Digital Twin
 * derive a timetable condition. It does not write sensors, GPS, crowd history,
 * or prediction confidence, and it does not rewrite non-DEMO passwords.
 */
@Component
@Profile("dev")
@Order(40)
@Slf4j
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.demo.ritdigitaltwin", havingValue = "true")
public class RitDigitalTwinDemoProfile implements CommandLineRunner {

    static final String PROFILE = "DEMO";
    static final String BUILDING_CODE = "DEMO-MAIN";
    static final String ANNEX_CODE = "DEMO-ANNEX";
    static final String BUILDING_NAME = "Main Academic Block";
    static final String SECTION = "CSE-A";
    static final String SUBJECT_CODE = "DEMO-CS-LAB";
    static final int ROOM_A_CAPACITY = 60;
    static final int ROOM_B_CAPACITY = 40;
    static final int SECTION_TARGET = 41;
    private static final ZoneId CAMPUS = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter CLOCK = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final Set<String> LOGIN_USERS = Set.of("DEMO-ADM", "DEMO-HOD", "DEMO-FAC", "DEMO-STU", "DEMO-PAR");
    private static final Set<String> FAKE_ASSETS = Set.of(
            "Dell Optiplex 7090", "Smart Interactive Whiteboard", "Epson", "Lathe");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final BuildingRepository buildingRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final ParentRepository parentRepository;
    private final AssetInventoryRepository assetInventoryRepository;
    private final String demoPassword;

    public RitDigitalTwinDemoProfile(UserRepository userRepository, RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder, DepartmentRepository departmentRepository,
                               BuildingRepository buildingRepository, ClassroomRepository classroomRepository,
                               StudentRepository studentRepository, SubjectRepository subjectRepository,
                               TimetableSlotRepository timetableSlotRepository, ParentRepository parentRepository,
                               AssetInventoryRepository assetInventoryRepository,
                               @Value("${app.demo.password:}") String demoPassword) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.departmentRepository = departmentRepository;
        this.buildingRepository = buildingRepository;
        this.classroomRepository = classroomRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.timetableSlotRepository = timetableSlotRepository;
        this.parentRepository = parentRepository;
        this.assetInventoryRepository = assetInventoryRepository;
        this.demoPassword = demoPassword == null ? "" : demoPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (demoPassword.isBlank()) {
            log.error("RIT Digital Twin DEMO profile is enabled but app.demo.password is empty. No demo accounts were written.");
            return;
        }
        Department cse = departmentRepository.findByCode("CSE")
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .code("CSE")
                        .deptName("B.E. Computer Science and Engineering")
                        .build()));

        Building main = ensureMainBuilding();
        Classroom roomA = ensureRoom(main, "Room A", ROOM_A_CAPACITY, "Lecture Hall");
        Classroom roomB = ensureRoom(main, "Room B", ROOM_B_CAPACITY, "Lecture Hall");
        nameRemainingRooms(main);
        ensureUnmeteredAnnex();

        ensureLogin("DEMO-ADM", "demo-adm@ritdigitaltwin.demo", Role.UserRole.ADMIN, "Demo", "Admin", cse);
        ensureLogin("DEMO-HOD", "demo-hod@ritdigitaltwin.demo", Role.UserRole.HOD, "Demo", "HOD", cse);
        User faculty = ensureLogin("DEMO-FAC", "demo-fac@ritdigitaltwin.demo", Role.UserRole.FACULTY, "Demo", "Faculty", cse);
        User studentUser = ensureLogin("DEMO-STU", "demo-stu@ritdigitaltwin.demo", Role.UserRole.STUDENT, "Demo", "Student", cse);
        User parentUser = ensureLogin("DEMO-PAR", "demo-par@ritdigitaltwin.demo", Role.UserRole.PARENT, "Demo", "Parent", cse);
        Student student = ensureStudent(studentUser, "DEMO-STU", "Demo Student", cse);
        ensureParent(parentUser, student);
        ensureSectionSize(cse);

        Subject subject = ensureSubject(cse);
        alignCurrentSlot(cse, subject, faculty, roomB);
        replaceKnownFakeAssets(roomB);

        log.info("RIT Digital Twin DEMO profile applied. building={} (id {}), rooms {} and {}, section {} size {}, "
                        + "slot realigned to the current Asia/Kolkata clock. Login accounts {} only. Password is not logged.",
                main.getCode(), main.getId(), roomA.getName(), roomB.getName(), SECTION,
                studentRepository.countBySection(SECTION), LOGIN_USERS);
    }

    private Building ensureMainBuilding() {
        Building building = buildingRepository.findByCode(BUILDING_CODE).orElseGet(this::claimIncompleteBuilding);
        building.setName(BUILDING_NAME);
        building.setCode(BUILDING_CODE);
        building.setLocation("DEMO profile — not a surveyed coordinate");
        building.setBaseEnergyLoad(new BigDecimal("150.00"));
        if (building.getTotalCapacity() == null) {
            building.setTotalCapacity(ROOM_A_CAPACITY + ROOM_B_CAPACITY);
        }
        return buildingRepository.save(building);
    }

    private Building claimIncompleteBuilding() {
        return buildingRepository.findAll().stream()
                .filter(row -> row.getCode() == null || row.getCode().isBlank()
                        || row.getName() == null || row.getName().isBlank())
                .findFirst()
                .orElseGet(Building::new);
    }

    private Classroom ensureRoom(Building building, String name, int capacity, String type) {
        List<Classroom> rooms = classroomRepository.findByBuilding_Id(building.getId());
        Classroom room = rooms.stream().filter(row -> name.equals(row.getName())).findFirst()
                .orElseGet(() -> rooms.stream()
                        .filter(row -> row.getName() == null || row.getName().isBlank())
                        .filter(row -> row.getCapacity() != null && row.getCapacity() == capacity)
                        .findFirst()
                        .orElseGet(Classroom::new));
        room.setName(name);
        room.setBuilding(building);
        room.setCapacity(capacity);
        room.setType(type);
        return classroomRepository.save(room);
    }

    private void nameRemainingRooms(Building building) {
        int extra = 0;
        for (Classroom room : classroomRepository.findByBuilding_Id(building.getId())) {
            if (room.getName() != null && !room.getName().isBlank()) {
                continue;
            }
            extra++;
            room.setName("Room " + (char) ('B' + extra));
            if (room.getType() == null || room.getType().isBlank()) {
                room.setType("Lecture Hall");
            }
            classroomRepository.save(room);
        }
    }

    private void ensureUnmeteredAnnex() {
        Building annex = buildingRepository.findByCode(ANNEX_CODE).orElseGet(Building::new);
        annex.setName("Unmetered Annex");
        annex.setCode(ANNEX_CODE);
        annex.setLocation("DEMO profile — no stored base load");
        annex.setBaseEnergyLoad(null);
        annex.setTotalCapacity(30);
        annex = buildingRepository.save(annex);
        ensureRoom(annex, "Annex Room", 30, "Lecture Hall");
    }

    private User ensureLogin(String username, String email, Role.UserRole roleName,
                             String first, String last, Department department) {
        Role role = roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
        User user = userRepository.findByUsername(username).orElseGet(User::new);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(demoPassword));
        user.setRole(role);
        user.setFirstName(first);
        user.setLastName(last);
        user.setDepartment(department);
        user.setAccountStatus("active");
        user.setMustChangePassword(false);
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        return userRepository.save(user);
    }

    private Student ensureStudent(User user, String registerNo, String name, Department department) {
        Student student = studentRepository.findByRegisterNo(registerNo)
                .orElseGet(() -> Student.builder().user(user).registerNo(registerNo).build());
        student.setUser(user);
        student.setRegisterNo(registerNo);
        student.setStudentIdNumber(registerNo);
        student.setStudentName(name);
        student.setSection(SECTION);
        student.setBatch("DEMO");
        student.setYear(2);
        student.setCurrentSemester(3);
        student.setStatus("active");
        student.setDepartment(department);
        student.setScholarType("Day Scholar");
        student.setEmail(user.getEmail());
        student.setCurrentCgpa(null);
        student = studentRepository.save(student);
        user.setLinkedStudent(student);
        userRepository.save(user);
        return student;
    }

    private void ensureParent(User parentUser, Student student) {
        Parent parent = parentRepository.findByUser_Id(parentUser.getId()).orElseGet(Parent::new);
        parent.setUser(parentUser);
        parent.setStudent(student);
        parent.setName("Demo Parent");
        parent.setRelationship("Parent");
        parent.setContactInfo("DEMO profile");
        parentRepository.save(parent);
    }

    private void ensureSectionSize(Department department) {
        Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT).orElseThrow();
        int index = 2;
        while (studentRepository.countBySection(SECTION) < SECTION_TARGET && index < 200) {
            String registerNo = String.format("DEMO-CSE-A-%02d", index);
            User user = userRepository.findByUsername(registerNo).orElseGet(User::new);
            if (user.getId() == null) {
                user.setUsername(registerNo);
                user.setEmail(registerNo.toLowerCase() + "@ritdigitaltwin.demo");
                user.setPassword(passwordEncoder.encode(OneTimeTokens.generate()));
                user.setMustChangePassword(true);
            }
            user.setRole(studentRole);
            user.setFirstName("Enrolment");
            user.setLastName(String.format("%02d", index));
            user.setDepartment(department);
            user.setAccountStatus("active");
            user = userRepository.save(user);
            ensureStudent(user, registerNo, "DEMO enrolment " + index, department);
            index++;
        }
    }

    private Subject ensureSubject(Department department) {
        Subject subject = subjectRepository.findBySubjectCode(SUBJECT_CODE).orElseGet(Subject::new);
        subject.setSubjectCode(SUBJECT_CODE);
        subject.setSubjectName("RIT Digital Twin Demo Studio");
        subject.setCredits(3);
        subject.setRegulation("DEMO");
        subject.setDepartment(department);
        subject.setDepartmentName(department.getDeptName());
        return subjectRepository.save(subject);
    }

    private void alignCurrentSlot(Department department, Subject subject, User faculty, Classroom room) {
        LocalDateTime now = LocalDateTime.now(CAMPUS);
        LocalTime clock = now.toLocalTime().withNano(0);
        LocalTime start = clock.minusMinutes(20);
        if (start.isAfter(clock)) {
            start = LocalTime.MIDNIGHT;
        }
        LocalTime end = clock.plusHours(2);
        if (!end.isAfter(clock)) {
            end = LocalTime.of(23, 59, 59);
        }
        TimetableSlot slot = timetableSlotRepository.findAll().stream()
                .filter(row -> SECTION.equals(row.getSection()))
                .filter(row -> row.getSubject() != null && SUBJECT_CODE.equals(row.getSubject().getSubjectCode()))
                .findFirst()
                .orElseGet(TimetableSlot::new);
        slot.setDayOfWeek(now.getDayOfWeek().name());
        slot.setStartTime(start.format(CLOCK));
        slot.setEndTime(end.format(CLOCK));
        slot.setSubject(subject);
        slot.setFaculty(faculty);
        slot.setSection(SECTION);
        slot.setDepartment(department);
        slot.setClassroom(room);
        timetableSlotRepository.save(slot);
        log.info("DEMO timetable slot covers {} {}-{} in {} so the campus clock reads it as now.",
                slot.getDayOfWeek(), slot.getStartTime(), slot.getEndTime(), room.getName());
    }

    private void replaceKnownFakeAssets(Classroom room) {
        List<AssetInventory> assets = assetInventoryRepository.findAll();
        boolean replaced = false;
        for (AssetInventory asset : assets) {
            if (asset.getAssetName() == null || !FAKE_ASSETS.contains(asset.getAssetName())) {
                continue;
            }
            if (!replaced) {
                asset.setAssetName("DEMO lecture display");
                asset.setCategory(PROFILE);
                asset.setStatus("stored");
                asset.setLastMaintained(null);
                asset.setLocation(BUILDING_NAME + " · " + room.getName());
                assetInventoryRepository.save(asset);
                replaced = true;
            } else {
                assetInventoryRepository.delete(asset);
            }
        }
        boolean present = assetInventoryRepository.findAll().stream()
                .anyMatch(asset -> "DEMO lecture display".equals(asset.getAssetName()));
        if (!present) {
            AssetInventory asset = new AssetInventory();
            asset.setAssetName("DEMO lecture display");
            asset.setCategory(PROFILE);
            asset.setStatus("stored");
            asset.setLocation(BUILDING_NAME + " · " + room.getName());
            assetInventoryRepository.save(asset);
        }
    }
}
