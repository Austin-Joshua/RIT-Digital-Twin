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

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class StudentDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

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
        list.add(new StudentInfo("211424104001", "Aakash", "S", false));
        list.add(new StudentInfo("211424104002", "Abinaya", "R", true));
        list.add(new StudentInfo("211424104003", "Adhithya", "M", false));
        list.add(new StudentInfo("211424104004", "Akshaya", "V", false));
        list.add(new StudentInfo("211424104005", "Bala", "Murugan", true));
        list.add(new StudentInfo("211424104006", "Deepika", "K", false));
        list.add(new StudentInfo("211424104007", "Dinesh", "Kumar", false));
        list.add(new StudentInfo("211424104008", "Ganesh", "P", true));
        list.add(new StudentInfo("211424104009", "Harini", "S", false));
        list.add(new StudentInfo("211424104010", "Ishwarya", "B", false));
        list.add(new StudentInfo("211424104011", "Karthik", "R", true));
        list.add(new StudentInfo("211424104012", "Kavitha", "M", false));
        list.add(new StudentInfo("211424104013", "Manoj", "S", false));
        list.add(new StudentInfo("211424104014", "Nandhini", "V", true));
        list.add(new StudentInfo("211424104015", "Praveen", "K", false));
        list.add(new StudentInfo("211424104016", "Rahul", "D", false));
        list.add(new StudentInfo("211424104017", "Sangeetha", "P", true));
        list.add(new StudentInfo("211424104018", "Sathish", "J", false));
        list.add(new StudentInfo("211424104019", "Swetha", "N", false));
        list.add(new StudentInfo("211424104020", "Vijay", "L", true));
        return list;
    }

    private List<StudentInfo> createCsbsData() {
        List<StudentInfo> list = new ArrayList<>();
        list.add(new StudentInfo("211424203001", "Anand", "R", false));
        list.add(new StudentInfo("211424203002", "Bhavya", "S", true));
        list.add(new StudentInfo("211424203003", "Charu", "L", false));
        list.add(new StudentInfo("211424203004", "Devika", "M", false));
        list.add(new StudentInfo("211424203005", "Eshwar", "K", true));
        list.add(new StudentInfo("211424203006", "Farhana", "A", false));
        list.add(new StudentInfo("211424203007", "Giri", "Dharen", false));
        list.add(new StudentInfo("211424203008", "Hemant", "C", true));
        list.add(new StudentInfo("211424203009", "Indhu", "P", false));
        list.add(new StudentInfo("211424203010", "Jaya", "Surya", false));
        list.add(new StudentInfo("211424203011", "Kiran", "Kumari", true));
        list.add(new StudentInfo("211424203012", "Lokesh", "W", false));
        list.add(new StudentInfo("211424203013", "Meghana", "V", false));
        list.add(new StudentInfo("211424203014", "Nithin", "G", true));
        list.add(new StudentInfo("211424203015", "Oviya", "S", false));
        list.add(new StudentInfo("211424203016", "Pranav", "M", false));
        list.add(new StudentInfo("211424203017", "Qasim", "H", true));
        list.add(new StudentInfo("211424203018", "Ramya", "K", false));
        list.add(new StudentInfo("211424203019", "Sanjay", "T", false));
        list.add(new StudentInfo("211424203020", "Tharun", "V", true));
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
