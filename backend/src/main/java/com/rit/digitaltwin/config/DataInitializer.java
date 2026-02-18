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
                    .username("admin")
                    .email("admin@ritchennai.edu.in")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User management = User.builder()
                    .username("management")
                    .email("management@ritchennai.edu.in")
                    .password(passwordEncoder.encode("manage123"))
                    .fullName("Management User")
                    .role(Role.MANAGEMENT)
                    .build();
            userRepository.save(management);

            User faculty = User.builder()
                    .username("faculty")
                    .email("faculty@ritchennai.edu.in")
                    .password(passwordEncoder.encode("faculty123"))
                    .fullName("Faculty User")
                    .role(Role.FACULTY)
                    .build();
            userRepository.save(faculty);

            log.info("Default users created: admin, management, faculty");
        }
    }
}
