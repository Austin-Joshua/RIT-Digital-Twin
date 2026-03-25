package com.university.erp.config;

import com.university.erp.entity.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

// @Component
@Profile("dev")
@org.springframework.context.annotation.Lazy
@Slf4j
public class StudentDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentDataSeeder(
            @org.springframework.context.annotation.Lazy UserRepository userRepository,
            @org.springframework.context.annotation.Lazy StudentRepository studentRepository,
            @org.springframework.context.annotation.Lazy RoleRepository roleRepository,
            @org.springframework.context.annotation.Lazy DepartmentRepository departmentRepository,
            @org.springframework.context.annotation.Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting Bulk Student Data Integration (Zero-Trust Identity Seeding)...");
        
        Role studentRole = roleRepository.findByRoleName(Role.UserRole.STUDENT)
                .orElseThrow(() -> new RuntimeException("STUDENT role not found"));
        
        Department cse = departmentRepository.findByCode("CSE")
                .orElseGet(() -> departmentRepository.save(Department.builder().code("CSE").deptName("B.E. Computer Science and Engineering").build()));
        
        Department csbs = departmentRepository.findByCode("CSBS")
                .orElseGet(() -> departmentRepository.save(Department.builder().code("CSBS").deptName("B.Tech. Computer Science and Business Systems").build()));

        // CSE-A Batch 2024-2028
        seedBatch(cse, "CSE-A", "2024-2028", createCseAData(), studentRole);
        
        // CSBS Batch 2024-2028
        seedBatch(csbs, "CSBS", "2024-2028", createCsbsData(), studentRole);
        
        log.info("Student Data Integration Complete.");
    }

    private void seedBatch(Department dept, String section, String batch, List<StudentInfo> records, Role role) {
        int created = 0;
        for (StudentInfo info : records) {
            if (userRepository.findByUsername(info.regNo).isPresent()) continue;

            User user = User.builder()
                    .username(info.regNo)
                    .password(passwordEncoder.encode(info.regNo)) // Default password = register number
                    .email(info.regNo + "@ritchennai.edu.in")
                    .firstName(info.firstName)
                    .lastName(info.lastName)
                    .role(role)
                    .department(dept)
                    .accountStatus("active")
                    .mustChangePassword(true) // Mandatory change on first login
                    .failedLoginAttempts(0)
                    .build();
            
            user = userRepository.save(user);

            Student student = Student.builder()
                    .user(user)
                    .registerNo(info.regNo)
                    .studentIdNumber("24" + dept.getCode() + info.regNo.substring(info.regNo.length() - 3))
                    .studentName(info.firstName + " " + info.lastName)
                    .section(section)
                    .batch(batch)
                    .year(1)
                    .status("active")
                    .department(dept)
                    .scholarType(info.isHosteller ? "Hosteller" : "Day Scholar")
                    .email(user.getEmail())
                    .build();
            
            studentRepository.save(student);
            
            user.setLinkedStudent(student);
            userRepository.save(user);
            created++;
        }
        log.info("Seeded {} new students for section {}", created, section);
    }

    private List<StudentInfo> createCseAData() {
        List<StudentInfo> list = new ArrayList<>();
        // Seed 2117240020001 to 2117240020062
        for (long i = 2117240020001L; i <= 2117240020062L; i++) {
            list.add(new StudentInfo(String.valueOf(i), "CSE-Student", String.valueOf(i % 100), i % 2 == 0));
        }
        return list;
    }

    private List<StudentInfo> createCsbsData() {
        List<StudentInfo> list = new ArrayList<>();
        // Seed 2117240080119 to 2117240080177 (Correcting 14-digit typo to 13-digit for consistency if prefix is same)
        // User typed: 21172400800119 to 2117240080177.
        // Let's use their exact strings if possible.
        // 21172400800119 is 14 digits. 2117240080177 is 13 digits. 
        // Clearly a typo. We will use the 13-digit range starting from 2117240080119.
        for (long i = 2117240080119L; i <= 2117240080177L; i++) {
            list.add(new StudentInfo(String.valueOf(i), "CSBS-Student", String.valueOf(i % 100), i % 2 != 0));
        }
        return list;
    }

    private static class StudentInfo {
        String regNo;
        String firstName;
        String lastName;
        boolean isHosteller;

        StudentInfo(String regNo, String firstName, String lastName, boolean isHosteller) {
            this.regNo = regNo;
            this.firstName = firstName;
            this.lastName = lastName;
            this.isHosteller = isHosteller;
        }
    }
}
