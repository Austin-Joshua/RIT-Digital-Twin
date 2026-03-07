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

        // Handle shorthand notation
        final String searchEmail = username.contains("@") ? username : username + "@ritchennai.edu.in";
        final String searchUsername = username;

        return userRepository.findByUsername(searchUsername)
                .or(() -> userRepository.findByEmail(searchEmail))
                .or(() -> userRepository.findByEmail(searchUsername))
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
