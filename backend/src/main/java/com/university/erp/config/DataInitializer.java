package com.university.erp.config;

import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
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
import java.time.LocalTime;
import java.util.List;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final TransportRouteRepository transportRouteRepository;
        private final BusStopRepository busStopRepository;
        private final AlumniProfileRepository alumniRepo;
        private final AssetInventoryRepository assetRepo;
        private final FacultyLeaveRequestRepository leaveRepo;

        public DataInitializer(UserRepository userRepository, RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder, TransportRouteRepository transportRouteRepository,
                        BusStopRepository busStopRepository, AlumniProfileRepository alumniRepo,
                        AssetInventoryRepository assetRepo, FacultyLeaveRequestRepository leaveRepo) {
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
                this.passwordEncoder = passwordEncoder;
                this.transportRouteRepository = transportRouteRepository;
                this.busStopRepository = busStopRepository;
                this.alumniRepo = alumniRepo;
                this.assetRepo = assetRepo;
                this.leaveRepo = leaveRepo;
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
                seedUser("admin@ritchennai.edu.in", "admin123", Role.UserRole.ADMIN, "System", "Admin");
                seedUser("faculty@ritchennai.edu.in", "faculty123", Role.UserRole.FACULTY, "John", "Faculty");
                seedUser("student@ritchennai.edu.in", "student123", Role.UserRole.STUDENT, "Jane", "Student");

                // Additional Demo Users
                seedUser("faculty2@ritchennai.edu.in", "faculty123", Role.UserRole.FACULTY, "Sarah", "Professor");
                seedUser("student2@ritchennai.edu.in", "student123", Role.UserRole.STUDENT, "Michael", "Lee");
                seedUser("student3@ritchennai.edu.in", "student123", Role.UserRole.STUDENT, "Emily", "Chen");

                // 3. Initialize Transport Data
                seedTransportData();

                // 4. Initialize ERP Data
                seedErpData();
        }

        private void seedUser(String email, String password, Role.UserRole roleEnum, String firstName,
                        String lastName) {
                userRepository.findByEmail(email).ifPresentOrElse(
                                user -> {
                                        log.info("Resetting password for demo user: {}", email);
                                        user.setPassword(passwordEncoder.encode(password));
                                        userRepository.save(user);
                                },
                                () -> {
                                        log.info("Seeding new demo user: {}", email);
                                        Role role = roleRepository.findByRoleName(roleEnum)
                                                        .orElseThrow(() -> new RuntimeException(
                                                                        "Error: Role " + roleEnum + " not found."));

                                        User user = User.builder()
                                                        .username(email)
                                                        .email(email)
                                                        .password(passwordEncoder.encode(password))
                                                        .firstName(firstName)
                                                        .lastName(lastName)
                                                        .role(role)
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
