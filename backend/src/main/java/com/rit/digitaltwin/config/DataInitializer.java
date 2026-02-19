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
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository,
            SustainabilityMetricRepository sustainabilityMetricRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Roles
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseGet(() -> roleRepository.save(new Role(null, "ADMIN", LocalDateTime.now())));
            roleRepository.findByRoleName("MANAGEMENT")
                    .orElseGet(() -> roleRepository.save(new Role(null, "MANAGEMENT", LocalDateTime.now())));
            roleRepository.findByRoleName("FACULTY")
                    .orElseGet(() -> roleRepository.save(new Role(null, "FACULTY", LocalDateTime.now())));
            Role studentRole = roleRepository.findByRoleName("STUDENT")
                    .orElseGet(() -> roleRepository.save(new Role(null, "STUDENT", LocalDateTime.now())));

            // Seed Admin User
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setEmail("admin@rit.edu");
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setRole(adminRole);
                userRepository.save(admin);
            }

            // Seed Student User
            if (!userRepository.existsByUsername("student")) {
                User student = new User();
                student.setUsername("student");
                student.setPassword(passwordEncoder.encode("password"));
                student.setEmail("student@ritchennai.edu.in");
                student.setFirstName("Austin");
                student.setLastName("Joshua M");
                student.setRole(studentRole);
                userRepository.save(student);
            }

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
        };
    }
}
