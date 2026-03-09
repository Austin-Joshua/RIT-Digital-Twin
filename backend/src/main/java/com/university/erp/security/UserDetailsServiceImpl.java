package com.university.erp.security;

import com.university.erp.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user by identifier: {}", username);
        if (username == null || username.isBlank()) {
            throw new UsernameNotFoundException("Username must not be empty");
        }
        String normalized = username.trim();
        String lower = normalized.toLowerCase();
        // Case-insensitive email lookup (DB stores lowercase)
        final String searchEmail = normalized.contains("@") ? lower : lower + "@ritchennai.edu.in";
        final String searchUsername = normalized;

        return userRepository.findByUsername(searchUsername)
                .or(() -> userRepository.findByUsername(lower))
                .or(() -> userRepository.findByEmail(searchEmail))
                .or(() -> userRepository.findByEmail(normalized))
                .map(user -> {
                    String roleName = user.getRole() != null && user.getRole().getRoleName() != null
                            ? user.getRole().getRoleName().name()
                            : "NONE";
                    log.info("Found user: {} with role: {}", user.getUsername(), roleName);
                    return user;
                })
                .orElseThrow(() -> {
                    log.error("User NOT found with identifier: {}", username);
                    return new UsernameNotFoundException("User Not Found with identifier: " + username);
                });
    }
}
