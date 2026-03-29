package com.university.erp.config;

import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;
import com.university.erp.repository.TransportRouteRepository;
import com.university.erp.repository.BusStopRepository;
import com.university.erp.model.TransportRoute;
import com.university.erp.model.BusStop;
import com.university.erp.model.AlumniProfile;
import com.university.erp.model.AssetInventory;
import com.university.erp.model.FacultyLeaveRequest;
import com.university.erp.repository.AlumniProfileRepository;
import com.university.erp.repository.AssetInventoryRepository;
import com.university.erp.repository.FacultyLeaveRequestRepository;
import com.university.erp.repository.DepartmentRepository;
import com.university.erp.repository.SubjectRepository;
import com.university.erp.model.Department;
import com.university.erp.model.Subject;
import com.university.erp.service.BruteForceProtectionService;
import java.time.LocalTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@org.springframework.core.annotation.Order(1)
@SuppressWarnings("unused") // Seeder utility methods kept for manual invocation; not all are called at startup
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final TransportRouteRepository transportRouteRepository;
        private final BusStopRepository busStopRepository;
        private final AlumniProfileRepository alumniRepo;
        private final AssetInventoryRepository assetRepo;
        private final FacultyLeaveRequestRepository leaveRepo;
        private final DepartmentRepository departmentRepository;
        private final SubjectRepository subjectRepository;
        private final JdbcTemplate jdbcTemplate;
        private final BruteForceProtectionService bruteForceProtectionService;

        public DataInitializer(UserRepository userRepository, RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder, TransportRouteRepository transportRouteRepository,
                        BusStopRepository busStopRepository, AlumniProfileRepository alumniRepo,
                        AssetInventoryRepository assetRepo, FacultyLeaveRequestRepository leaveRepo,
                        DepartmentRepository departmentRepository, SubjectRepository subjectRepository,
                        JdbcTemplate jdbcTemplate, BruteForceProtectionService bruteForceProtectionService) {
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
                this.passwordEncoder = passwordEncoder;
                this.transportRouteRepository = transportRouteRepository;
                this.busStopRepository = busStopRepository;
                this.alumniRepo = alumniRepo;
                this.assetRepo = assetRepo;
                this.leaveRepo = leaveRepo;
                this.departmentRepository = departmentRepository;
                this.subjectRepository = subjectRepository;
                this.jdbcTemplate = jdbcTemplate;
                this.bruteForceProtectionService = bruteForceProtectionService;
        }

        @Override
        @Transactional
        public void run(String... args) throws Exception {
                // 1. Initialize Roles
                for (Role.UserRole roleEnum : Role.UserRole.values()) {
                        if (roleRepository.findByRoleName(roleEnum).isEmpty()) {
                                log.info("Seeding role: {}", roleEnum);
                                roleRepository.save(Role.builder()
                                                .roleName(roleEnum)
                                                .build());
                        }
                }

                // 2. Initialize Default Users
                seedUser("ADM-001", "admin@ritchennai.edu.in", "ADM-001", Role.UserRole.ADMIN, "System", "Admin");
                seedUser("FAC-001", "faculty@ritchennai.edu.in", "FAC-001", Role.UserRole.FACULTY, "John", "Faculty");
                seedUser("student@ritchennai.edu.in", "student@ritchennai.edu.in", "student123", Role.UserRole.STUDENT, "Jane", "Student");

                // Parent Seed
                seedUser("parent@ritchennai.edu.in", "parent@ritchennai.edu.in", "parent123", Role.UserRole.PARENT, "Ram", "Parent");

                // Remaining seeders commented out due to schema inconsistencies
                // migrateLegacyRolesToAdmin();
                // seedRitDepartments();
                // seedTransportData();
                // seedErpData();
                // seedCsbsData();
                // ensureDemoAcademicLinks();
                seedHodsForAllDepartments();
                // assignFacultyToDepartment();
                // assignRegisterNumbersToDemoStudents();

                bruteForceProtectionService.clearAll();
                log.info("Cleared login attempt blocks for all accounts.");
        }

        /** UG and PG programmes as per RIT Chennai (ritchennai.org) */
        private void seedRitDepartments() {
                Map<String, String> depts = new LinkedHashMap<>();
                // UG Programmes
                depts.put("CSE", "B.E. Computer Science and Engineering");
                depts.put("AIML", "B.E. Computer Science and Engineering (AI&ML)");
                depts.put("CCE", "B.E. Computer and Communication Engineering");
                depts.put("ECE", "B.E. Electronics and Communication Engineering");
                depts.put("MECH", "B.E. Mechanical Engineering");
                depts.put("VLSI", "B.E. Electronic Engineering (VLSI)");
                depts.put("AIDS", "B.Tech. Artificial Intelligence and Data Science");
                depts.put("CSBS", "B.Tech. Computer Science and Business Systems");
                depts.put("BT", "B.Tech Bio Technology");
                // PG Programmes
                depts.put("MEVLSI", "M.E. Electronics and Communication Engineering (VLSI Design)");
                depts.put("SANDH", "Science and Humanities (First year / H&S)");
                for (Map.Entry<String, String> e : depts.entrySet()) {
                        if (departmentRepository.findByCode(e.getKey()).isEmpty()) {
                                log.info("Seeding RIT department: {} - {}", e.getKey(), e.getValue());
                                departmentRepository.save(Department.builder()
                                                .code(e.getKey())
                                                .deptName(e.getValue())
                                                .build());
                        }
                }
        }

        /** One HOD per department: credentials per HOD_CREDENTIALS.md (hod_<code>@ritchennai.edu.in / hod<code>123) */
        private void seedHodsForAllDepartments() {
                try {
                        List<String> codes = List.of("CSE", "AIML", "CCE", "ECE", "MECH", "VLSI", "AIDS", "CSBS", "BT", "MEVLSI", "SANDH");
                        for (String code : codes) {
                                String email = "hod_" + code.toLowerCase() + "@ritchennai.edu.in";
                                String password = "hod" + code.toLowerCase() + "123";
                                String firstName = "HOD";
                                String lastName = code;
                                seedUser(email, email, password, Role.UserRole.HOD, firstName, lastName);
                                departmentRepository.findByCode(code).ifPresent(dept ->
                                        userRepository.findByEmail(email).ifPresent(user -> {
                                                if (user.getDepartment() == null) {
                                                        user.setDepartment(dept);
                                                        userRepository.save(user);
                                                        log.info("Assigned HOD {} to department: {}", email, code);
                                                }
                                        }));
                        }
                        // Legacy single HOD (redirect to CSBS if still used)
                        seedUser("hod@ritchennai.edu.in", "hod@ritchennai.edu.in", "hod123", Role.UserRole.HOD, "HOD", "Department");
                        departmentRepository.findByCode("CSBS").ifPresent(dept ->
                                userRepository.findByEmail("hod@ritchennai.edu.in").ifPresent(user -> {
                                        if (user.getDepartment() == null) {
                                                user.setDepartment(dept);
                                                userRepository.save(user);
                                                log.info("Assigned HOD hod@ritchennai.edu.in to department: CSBS");
                                        }
                                }));
                } catch (Exception e) {
                        log.warn("HOD seeding failed (check roles/departments exist): {}", e.getMessage());
                }
        }

        private void assignFacultyToDepartment() {
                try {
                        Department dept = departmentRepository.findByCode("CSBS").orElse(null);
                        if (dept == null) return;
                        for (String email : List.of("faculty@ritchennai.edu.in", "faculty2@ritchennai.edu.in")) {
                                userRepository.findByEmail(email).ifPresent(user -> {
                                        if (user.getDepartment() == null) {
                                                user.setDepartment(dept);
                                                userRepository.save(user);
                                                log.info("Assigned faculty {} to department: {}", email, dept.getCode());
                                        }
                                });
                        }
                } catch (Exception e) {
                        log.debug("Faculty department assignment skipped: {}", e.getMessage());
                }
        }

        /** Migrates any users with BOSS/MANAGEMENT/SUPER_ADMIN to ADMIN and removes those role rows. */
        private void migrateLegacyRolesToAdmin() {
                try {
                        Long adminId = roleRepository.findByRoleName(Role.UserRole.ADMIN)
                                        .map(Role::getRoleId)
                                        .orElse(null);
                        if (adminId == null) return;

                        List<Long> legacyRoleIds = jdbcTemplate.queryForList(
                                        "SELECT role_id FROM roles WHERE role_name IN ('BOSS','MANAGEMENT','SUPER_ADMIN')",
                                        Long.class);
                        if (legacyRoleIds.isEmpty()) return;

                        String placeholders = String.join(",", Collections.nCopies(legacyRoleIds.size(), "?"));
                        Object[] args = new Object[legacyRoleIds.size() + 1];
                        args[0] = adminId;
                        for (int i = 0; i < legacyRoleIds.size(); i++) {
                                args[i + 1] = legacyRoleIds.get(i);
                        }
                        int updated = jdbcTemplate.update(
                                        "UPDATE users SET role_id = ? WHERE role_id IN (" + placeholders + ")",
                                        args);
                        if (updated > 0) log.info("Migrated {} users from BOSS/MANAGEMENT/SUPER_ADMIN to ADMIN", updated);

                        for (Long id : legacyRoleIds) {
                                jdbcTemplate.update("DELETE FROM roles WHERE role_id = ?", id);
                        }
                        log.info("Removed BOSS, MANAGEMENT, SUPER_ADMIN roles");
                } catch (Exception e) {
                        log.debug("Role migration skipped or already applied: {}", e.getMessage());
                }
        }

        private void seedUser(String username, String email, String password, Role.UserRole roleEnum, String firstName,
                        String lastName) {
                userRepository.findByEmail(email).ifPresentOrElse(
                                user -> {
                                        log.info("Updating existing demo user: {}", email);
                                        user.setUsername(username);
                                        user.setPassword(passwordEncoder.encode(password));

                                        Role role = roleRepository.findByRoleName(roleEnum)
                                                        .orElseThrow(() -> new RuntimeException(
                                                                        "Role " + roleEnum + " not found"));
                                        user.setRole(role);
                                        user.setMustChangePassword(false);

                                        userRepository.save(user);
                                },
                                () -> {
                                        log.info("Seeding new demo user: {}", email);
                                        Role role = roleRepository.findByRoleName(roleEnum)
                                                        .orElseThrow(() -> new RuntimeException(
                                                                        "Error: Role " + roleEnum + " not found."));

                                        User user = User.builder()
                                                        .username(username)
                                                        .email(email)
                                                        .password(passwordEncoder.encode(password))
                                                        .firstName(firstName)
                                                        .lastName(lastName)
                                                        .role(role)
                                                        .mustChangePassword(false)
                                                        .build();

                                        userRepository.save(user);
                                });
        }

        private void seedErpData() {
                if (alumniRepo.count() == 0) {
                        AlumniProfile p1 = new AlumniProfile();
                        p1.setName("Arjun Kumar");
                        p1.setBatch("2018-2022");
                        p1.setDepartment("Computer Science");
                        p1.setCompany("Amazon");
                        p1.setDesignation("Software Development Eng");
                        alumniRepo.save(p1);

                        AlumniProfile p2 = new AlumniProfile();
                        p2.setName("Priya R");
                        p2.setBatch("2017-2021");
                        p2.setDepartment("ECE");
                        p2.setCompany("TCS");
                        p2.setDesignation("Systems Engineer");
                        alumniRepo.save(p2);
                }

                if (assetRepo.count() == 0) {
                        AssetInventory a1 = new AssetInventory();
                        a1.setAssetName("Dell Optiplex 7090");
                        a1.setCategory("Electronics");
                        a1.setStatus("Active");
                        a1.setLastMaintained("2024-01-15");
                        a1.setLocation("Lab 4");
                        assetRepo.save(a1);

                        AssetInventory a2 = new AssetInventory();
                        a2.setAssetName("Smart Interactive Whiteboard");
                        a2.setCategory("Furniture");
                        a2.setStatus("Maintenance Required");
                        a2.setLastMaintained("2023-10-12");
                        a2.setLocation("Room 102");
                        assetRepo.save(a2);
                }

                if (leaveRepo.count() == 0) {
                        FacultyLeaveRequest l1 = new FacultyLeaveRequest();
                        l1.setFacultyId("FAC-001");
                        l1.setFacultyName("Dr. Anita S");
                        l1.setLeaveType("Casual Leave");
                        l1.setStartDate("2024-04-10");
                        l1.setEndDate("2024-04-12");
                        l1.setStatus("Pending");
                        leaveRepo.save(l1);
                }
        }

        private void seedTransportData() {
                if (transportRouteRepository.count() == 0) {
                        // Coordinators
                        String coord1 = "A. Kalesha";
                        String phone1 = "6380751700";
                        String coord2 = "N. Sudhakar";
                        String phone2 = "7548862447";

                        // Helper to seed a route
                        seedRoute("R01", "Ennore", "Ennore", LocalTime.of(5, 50), coord1, phone1, List.of(
                                        new StopInfo("Ennore", LocalTime.of(5, 50), "Railway Station"),
                                        new StopInfo("Ernavoor", LocalTime.of(5, 54), "Junction"),
                                        new StopInfo("Theradi", LocalTime.of(6, 3), "Metro"),
                                        new StopInfo("Tollgate", LocalTime.of(6, 18), "Plaza"),
                                        new StopInfo("New Washermenpet", LocalTime.of(6, 27), "Police Station"),
                                        new StopInfo("Mint", LocalTime.of(6, 37), "Clock Tower"),
                                        new StopInfo("Basin Bridge", LocalTime.of(6, 41), "Bridge")));

                        seedRoute("R02", "Triplicane", "Triplicane", LocalTime.of(6, 20), coord2, phone2, List.of(
                                        new StopInfo("Triplicane", LocalTime.of(6, 20), "High School"),
                                        new StopInfo("Light House", LocalTime.of(6, 32), "Beach"),
                                        new StopInfo("Mylapore Tank", LocalTime.of(6, 37), "Temple"),
                                        new StopInfo("Adyar", LocalTime.of(6, 50), "Signal"),
                                        new StopInfo("Guindy", LocalTime.of(7, 8), "Metro Station")));

                        seedRoute("R11", "Chengalpattu", "Chengalpattu", LocalTime.of(6, 0), coord1, phone1, List.of(
                                        new StopInfo("New Bus Stand", LocalTime.of(6, 0), "Platform 1"),
                                        new StopInfo("Singaperumal Koil", LocalTime.of(6, 15), "Temple Junction"),
                                        new StopInfo("Maraimalai Nagar", LocalTime.of(6, 22), "Ford Gate"),
                                        new StopInfo("Guduvanchery", LocalTime.of(6, 35), "Bus Stop"),
                                        new StopInfo("Vandalur", LocalTime.of(6, 42), "Zoo Entrance"),
                                        new StopInfo("Tambaram Gate", LocalTime.of(6, 55), "Airforce Station")));

                        seedRoute("R14", "Thiruvallur", "Thiruvallur", LocalTime.of(6, 25), coord2, phone2, List.of(
                                        new StopInfo("Thiruvallur", LocalTime.of(6, 25), "Bus Stand"),
                                        new StopInfo("Collector Office", LocalTime.of(6, 30), "Main Gate"),
                                        new StopInfo("Putlur", LocalTime.of(6, 40), "Railway Station"),
                                        new StopInfo("Veppampattu", LocalTime.of(6, 45), "Junction"),
                                        new StopInfo("Sevvapet", LocalTime.of(6, 50), "Temple")));

                        seedRoute("R22", "Thiruthani", "Thiruthani", LocalTime.of(5, 55), coord1, phone1, List.of(
                                        new StopInfo("Thiruthani Bypass", LocalTime.of(5, 55), "Bypass"),
                                        new StopInfo("Nagalamman Nagar", LocalTime.of(6, 8), "Entrance"),
                                        new StopInfo("Jothi Nagar", LocalTime.of(6, 12), "Park"),
                                        new StopInfo("New Bus Stand", LocalTime.of(6, 22), "Platform"),
                                        new StopInfo("Navy Gate", LocalTime.of(6, 30), "Gate")));

                        // Seed the rest of the 51 routes (basic info)
                        String[][] basicRoutes = {
                                        { "R01A", "Tondiarpet", "06:17" }, { "R01B", "Kasimedu", "06:15" },
                                        { "R03", "Choolai", "06:20" },
                                        { "R03A", "Collector Nagar", "06:50" }, { "R03B", "Water Tank", "06:40" },
                                        { "R04", "East Mogappair", "06:30" },
                                        { "R05", "CIT Nagar", "06:10" }, { "R05A", "Loyola College", "06:40" },
                                        { "R06", "Chinmayanagar", "06:10" },
                                        { "R07", "Santhome", "06:10" }, { "R08", "Kovilambakkam", "06:10" },
                                        { "R08A", "Adambakkam", "06:30" },
                                        { "R09", "MKB Nagar", "06:00" }, { "R09A", "Perambur", "06:30" },
                                        { "R10", "Thachoor", "05:50" },
                                        { "R11A", "Guduvanchery", "06:30" }, { "R12", "Minjur", "05:45" },
                                        { "R13", "Vyasarpadi", "06:10" },
                                        { "R13A", "ICF", "06:45" }, { "R14A", "Kakkalur", "06:55" },
                                        { "R15", "Kancheepuram", "06:00" },
                                        { "R15A", "Orikkai", "06:15" }, { "R16", "Neelankarai", "06:10" },
                                        { "R16A", "Guindy", "06:45" },
                                        { "R16B", "Sholinganallur", "06:10" }, { "R17", "Valluvarkottam", "06:15" },
                                        { "R17A", "Valasaravakkam", "06:45" },
                                        { "R18", "Pallikaranai", "06:15" }, { "R18A", "Sembakkam", "06:25" },
                                        { "R18B", "Kelambakkam", "06:00" },
                                        { "R19", "Poombukar", "06:10" }, { "R19A", "Vinayagapuram", "06:45" },
                                        { "R20", "Vepampattu", "06:30" },
                                        { "R21", "Ayyapakkam", "06:15" }, { "R22A", "SR Gate", "06:30" },
                                        { "R23", "K4 Police Station", "06:35" },
                                        { "R24", "Arcot", "05:25" }, { "R25", "Kallikuppam", "06:45" },
                                        { "R25A", "Pudur", "06:45" },
                                        { "R26", "Andarkuppam", "06:35" }, { "R27", "Avadi", "06:25" },
                                        { "R27A", "Kollumedu", "06:30" },
                                        { "R28", "Agaram", "06:20" }, { "R29", "Velachery", "06:10" },
                                        { "R29A", "Pammal", "06:35" },
                                        { "R29B", "Sivanthangal", "07:05" }
                        };

                        for (String[] r : basicRoutes) {
                                LocalTime startTime = LocalTime.parse(r[2]);
                                List<StopInfo> genericStops = List.of(
                                                new StopInfo(r[1], startTime, "Bus Stand"),
                                                new StopInfo(r[1] + " Junction", startTime.plusMinutes(15),
                                                                "Main Road"),
                                                new StopInfo("RIT Campus", startTime.plusMinutes(45), "College Gate"));
                                seedRoute(r[0], r[1] + " Route", r[1], startTime, coord1, phone1, genericStops);
                        }
                }
        }

        private void seedRoute(String num, String name, String start, LocalTime time, String coord, String phone,
                        List<StopInfo> stops) {
                TransportRoute route = transportRouteRepository.save(TransportRoute.builder()
                                .routeNumber(num).routeName(name).startPoint(start).endPoint("RIT Campus")
                                .busNumber("TN-RIT-" + num).capacity(60).currentOccupancy(0)
                                .coordinatorName(coord).coordinatorPhone(phone).build());

                if (stops != null) {
                        int order = 1;
                        for (StopInfo s : stops) {
                                busStopRepository.save(BusStop.builder()
                                                .route(route).stopName(s.name).pickupTime(s.time).stopOrder(order++)
                                                .landmark(s.landmark).build());
                        }
                } else {
                        // Add at least one stop for the starting point
                        busStopRepository.save(BusStop.builder()
                                        .route(route).stopName(start).pickupTime(time).stopOrder(1)
                                        .landmark("Starting Point").build());
                }
        }

        private void seedCsbsData() {
                Department csbs = departmentRepository.findByCode("CSBS").orElseGet(() -> {
                        log.info("Seeding CSBS Department");
                        return departmentRepository.save(Department.builder()
                                        .deptName("Computer Science and Business Systems")
                                        .code("CSBS")
                                        .build());
                });

                seedSubject(csbs, "Communicative English", "HS23111", 3, "R2023");
                seedSubject(csbs, "Engineering Chemistry", "CY23111", 3, "R2023");
                seedSubject(csbs, "Matrices and Calculus", "MA23111", 4, "R2023");
                seedSubject(csbs, "Problem Solving and C Programming", "GE23111", 3, "R2023");
                seedSubject(csbs, "Engineering Graphics", "GE23131", 4, "R2023");
                seedSubject(csbs, "Statistics and Numerical Methods", "MA23211", 4, "R2023");
                seedSubject(csbs, "Physics for Information Science", "PH23211", 3, "R2023");
                seedSubject(csbs, "Discrete Mathematics", "MA23311", 4, "R2023");
                seedSubject(csbs, "Fundamentals of Economics and Financial Accounting", "CB23311", 4, "R2023");
                seedSubject(csbs, "Object Oriented Programming", "CS23312", 3, "R2023");
                seedSubject(csbs, "Data Structures and Algorithms", "CS23314", 3, "R2023");
                seedSubject(csbs, "Data and Information Security", "CB23511", 3, "R2023");
                seedSubject(csbs, "Fundamentals of Management", "CB23512", 3, "R2023");
                seedSubject(csbs, "Business Analytics", "CB23531", 4, "R2023");
        }

        /**
         * Auto-repair deterministic demo links for end-to-end academic workflows.
         * Ensures faculty profiles, faculty-subject mappings, student-user links, and parent ward link.
         */
        private void ensureDemoAcademicLinks() {
                try {
                        jdbcTemplate.update("""
                                        INSERT IGNORE INTO faculty_profiles (user_id, employee_code, department, status)
                                        SELECT u.user_id, 'FAC-001', 'CSBS', 'active'
                                        FROM users u
                                        JOIN roles r ON r.role_id = u.role_id
                                        WHERE r.role_name = 'FACULTY' AND u.username = 'FAC-001'
                                          AND NOT EXISTS (
                                            SELECT 1 FROM faculty_profiles fp WHERE fp.employee_code = 'FAC-001'
                                          )
                                        """);

                        jdbcTemplate.update("""
                                        UPDATE users u
                                        JOIN roles r ON r.role_id = u.role_id
                                        SET u.linked_student_id = (
                                          SELECT s.id FROM students s WHERE s.user_id = u.user_id LIMIT 1
                                        )
                                        WHERE r.role_name = 'STUDENT'
                                          AND u.linked_student_id IS NULL
                                          AND EXISTS (SELECT 1 FROM students s2 WHERE s2.user_id = u.user_id)
                                        """);

                        jdbcTemplate.update("""
                                        UPDATE users p
                                        JOIN roles rp ON rp.role_id = p.role_id AND rp.role_name = 'PARENT'
                                        SET p.linked_student_id = (
                                          SELECT s.id
                                          FROM students s
                                          ORDER BY s.id ASC
                                          LIMIT 1
                                        )
                                        WHERE p.linked_student_id IS NULL
                                        """);

                        jdbcTemplate.update("""
                                        INSERT IGNORE INTO faculty_subjects (faculty_id, subject_id, section, semester_id, created_at)
                                        SELECT fp.faculty_id, ss.subject_id, COALESCE(st.section,'CSE-A'), ss.semester_id, CURRENT_TIMESTAMP
                                        FROM faculty_profiles fp
                                        JOIN users fu ON fu.user_id = fp.user_id
                                        JOIN roles fr ON fr.role_id = fu.role_id AND fr.role_name = 'FACULTY'
                                        JOIN student_subjects ss ON 1=1
                                        JOIN students st ON st.id = ss.student_id
                                        WHERE st.section IS NOT NULL
                                          AND NOT EXISTS (
                                            SELECT 1
                                            FROM faculty_subjects fs
                                            WHERE fs.faculty_id = fp.faculty_id
                                              AND fs.subject_id = ss.subject_id
                                              AND LOWER(fs.section) = LOWER(COALESCE(st.section,'CSE-A'))
                                              AND fs.semester_id = ss.semester_id
                                          )
                                        """);

                        log.info("Demo academic links repaired: faculty profiles, subject mappings, student/parent links.");
                } catch (Exception e) {
                        log.warn("Demo academic link repair skipped: {}", e.getMessage());
                }
        }

        /**
         * Assigns fixed registration numbers to the core demo students
         * so the user can test logging in via registerNo.
         */
        private void assignRegisterNumbersToDemoStudents() {
                try {
                        String[][] studentData = {
                                {"student@ritchennai.edu.in", "211422104101", "CSE-A"},
                                {"student2@ritchennai.edu.in", "211422104102", "CSE-A"},
                                {"student3@ritchennai.edu.in", "211422104103", "CSE-B"}
                        };

                        for (String[] data : studentData) {
                                String email = data[0];
                                String regNo = data[1];
                                String section = data[2];

                                // 1. Ensure a student record exists for this user
                                jdbcTemplate.update("""
                                        INSERT INTO students (user_id, register_no, student_id_number, section, created_at)
                                        SELECT u.user_id, ?, ?, ?, CURRENT_TIMESTAMP
                                        FROM users u
                                        WHERE u.email = ?
                                          AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.user_id)
                                        """, regNo, regNo, section, email);

                                // 2. Update the existing student record (if it already existed)
                                jdbcTemplate.update("""
                                        UPDATE students s
                                        JOIN users u ON u.user_id = s.user_id
                                        SET s.register_no = ?, s.student_id_number = ?, s.section = ?
                                        WHERE u.email = ?
                                        """, regNo, regNo, section, email);
                                
                                // 3. Ensure the user's linked_student_id is set
                                jdbcTemplate.update("""
                                        UPDATE users u
                                        JOIN students s ON s.user_id = u.user_id
                                        SET u.linked_student_id = s.id
                                        WHERE u.email = ?
                                        """, email);
                                
                                log.info("Assigned register number {} to {}", regNo, email);
                        }
                } catch (Exception e) {
                        log.warn("Failed to assign register numbers to demo students: {}", e.getMessage());
                }
        }

        private void seedSubject(Department dept, String name, String code, int credits, String regulation) {
                if (subjectRepository.findBySubjectCode(code).isEmpty()) {
                        log.info("Seeding Subject: {} ({})", name, code);
                        subjectRepository.save(Subject.builder()
                                        .subjectName(name)
                                        .subjectCode(code)
                                        .credits(credits)
                                        .regulation(regulation)
                                        .department(dept)
                                        .build());
                }
        }

        private static class StopInfo {
                String name;
                LocalTime time;
                String landmark;

                StopInfo(String n, LocalTime t, String l) {
                        this.name = n;
                        this.time = t;
                        this.landmark = l;
                }
        }
}
