package com.university.erp.config;

import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Initialize Roles
        for (Role.UserRole roleEnum : Role.UserRole.values()) {
            if (roleRepository.findByRoleName(roleEnum).isEmpty()) {
                roleRepository.save(Role.builder()
                        .roleName(roleEnum)
                        .build());
            }
        }

        // 2. Initialize Default Users
        seedUser("admin@ritchennai.edu.in", "admin123", Role.UserRole.ADMIN, "System", "Admin");
        seedUser("faculty@ritchennai.edu.in", "faculty123", Role.UserRole.FACULTY, "John", "Faculty");
        seedUser("student@ritchennai.edu.in", "student123", Role.UserRole.STUDENT, "Jane", "Student");
    }

    private void seedUser(String email, String password, Role.UserRole roleEnum, String firstName, String lastName) {
        if (userRepository.findByUsername(email).isEmpty()) {
            Role role = roleRepository.findByRoleName(roleEnum)
                    .orElseThrow(() -> new RuntimeException("Error: Role " + roleEnum + " not found."));

            User user = User.builder()
                    .username(email)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(role)
                    .build();

            userRepository.save(user);
        }
    }
}
