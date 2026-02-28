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
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .map(user -> {
                    log.info("Found user: {} with role: {}", user.getUsername(), user.getRole().getRoleName());
                    return user;
                })
                .orElseThrow(() -> {
                    log.error("User NOT found with identifier: {}", username);
                    return new UsernameNotFoundException("User Not Found with identifier: " + username);
                });
    }
}
