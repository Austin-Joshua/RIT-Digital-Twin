package com.rit.digitaltwin.config;

import com.rit.digitaltwin.model.Role;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .firstName("System")
                    .lastName("Administrator")
                    .email("admin@ritchennai.edu.in")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User faculty = User.builder()
                    .firstName("Faculty")
                    .lastName("User")
                    .email("faculty@ritchennai.edu.in")
                    .password(passwordEncoder.encode("faculty123"))
                    .role(Role.FACULTY)
                    .build();
            userRepository.save(faculty);

            User student = User.builder()
                    .firstName("Student")
                    .lastName("User")
                    .email("student@ritchennai.edu.in")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.STUDENT)
                    .build();
            userRepository.save(student);

            log.info("Default users created: admin, management, faculty");
        }
    }
}
