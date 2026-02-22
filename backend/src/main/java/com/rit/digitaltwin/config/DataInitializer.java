package com.rit.digitaltwin.config;

import com.rit.digitaltwin.model.Role;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.model.SustainabilityMetric;
import com.rit.digitaltwin.repository.RoleRepository;
import com.rit.digitaltwin.repository.UserRepository;
import com.rit.digitaltwin.repository.SustainabilityMetricRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository,
            SustainabilityMetricRepository sustainabilityMetricRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // Seed Roles
                Role adminRole = roleRepository.findByRoleName("ADMIN")
                        .orElseGet(() -> roleRepository.save(new Role(null, "ADMIN")));
                roleRepository.findByRoleName("MANAGEMENT")
                        .orElseGet(() -> roleRepository.save(new Role(null, "MANAGEMENT")));
                roleRepository.findByRoleName("FACULTY")
                        .orElseGet(() -> roleRepository.save(new Role(null, "FACULTY")));
                Role studentRole = roleRepository.findByRoleName("STUDENT")
                        .orElseGet(() -> roleRepository.save(new Role(null, "STUDENT")));

                // Seed Admin User
                User admin = userRepository.findByUsername("admin").orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername("admin");
                    newUser.setEmail("admin@rit.edu");
                    newUser.setFirstName("System");
                    newUser.setLastName("Administrator");
                    newUser.setRole(adminRole);
                    return newUser;
                });
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);

                // Seed Student User
                User student = userRepository.findByUsername("student").orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername("student");
                    newUser.setEmail("student@ritchennai.edu.in");
                    newUser.setFirstName("Austin");
                    newUser.setLastName("Joshua M");
                    newUser.setRole(studentRole);
                    return newUser;
                });
                student.setPassword(passwordEncoder.encode("student123"));
                userRepository.save(student);

                // Seed Faculty User
                User faculty = userRepository.findByUsername("faculty").orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername("faculty");
                    newUser.setEmail("faculty@ritchennai.edu.in");
                    newUser.setFirstName("Dr. RIT");
                    newUser.setLastName("Faculty");
                    roleRepository.findByRoleName("FACULTY").ifPresent(newUser::setRole);
                    return newUser;
                });
                faculty.setPassword(passwordEncoder.encode("faculty123"));
                userRepository.save(faculty);

                // Seed Sustainability Data
                if (sustainabilityMetricRepository.count() == 0) {
                    SustainabilityMetric metric = new SustainabilityMetric();
                    metric.setDate(LocalDate.now());
                    metric.setEnergyScore(88.0);
                    metric.setTransportScore(75.5);
                    metric.setWasteManagementScore(92.0);
                    metric.setCompositeIndex(85.17);
                    sustainabilityMetricRepository.save(metric);
                }
            } catch (Exception e) {
                System.err.println("Critical warning: Data initialization failed.");
                e.printStackTrace();
            }
        };
    }
}
