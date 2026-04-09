package com.university.erp.security;

import com.university.erp.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(@org.springframework.context.annotation.Lazy UserRepository userRepository) {
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
        
        final String searchEmail = normalized.contains("@") ? lower : lower + "@ritchennai.edu.in";
        final String searchUsername = normalized;

        UserDetails direct = userRepository.findByUsername(searchUsername)
                .or(() -> userRepository.findByUsername(lower))
                .or(() -> userRepository.findByEmail(searchEmail))
                .or(() -> userRepository.findByEmail(normalized))
                .or(() -> userRepository.findByEmail("hod_" + lower + "@ritchennai.edu.in"))
                .or(() -> userRepository.findByLinkedStudent_RegisterNo(normalized))
                .or(() -> userRepository.findByLinkedStudent_StudentIdNumber(normalized))
                .map(user -> {
                    String roleName = user.getRole() != null && user.getRole().getRoleName() != null
                            ? user.getRole().getRoleName().name()
                            : "NONE";
                    log.info("Found user: {} with role: {}", user.getUsername(), roleName);
                    return user;
                })
                .orElse(null);
        if (direct != null) {
            return direct;
        }

        for (String candidate : deriveRegisterNoCandidates(normalized)) {
            UserDetails byCandidate = userRepository.findByLinkedStudent_RegisterNo(candidate)
                    .or(() -> userRepository.findByUsername(candidate))
                    .orElse(null);
            if (byCandidate != null) {
                log.info("Resolved user by register candidate {} for identifier {}", candidate, username);
                return byCandidate;
            }
        }

        for (String suffix : deriveRegisterNoSuffixCandidates(normalized)) {
            List<com.university.erp.model.User> matches = userRepository.findAllByLinkedStudent_RegisterNoEndingWith(suffix);
            if (matches.size() == 1) {
                log.info("Resolved user by register suffix {} for identifier {}", suffix, username);
                return matches.get(0);
            }
        }

        log.error("User NOT found with identifier: {}", username);
        throw new UsernameNotFoundException("User Not Found with identifier: " + username);
    }

    private List<String> deriveRegisterNoCandidates(String identifier) {
        Set<String> candidates = new LinkedHashSet<>();
        String lower = identifier.toLowerCase();

        if (identifier.matches("^\\d{10,14}$")) {
            candidates.add(identifier);
        }
        if (lower.contains("@")) {
            String local = lower.split("@")[0];
            if (local.matches("^\\d{10,14}$")) {
                candidates.add(local);
            }
            String trailingDigits = extractTrailingDigits(local);
            if (trailingDigits != null && trailingDigits.length() >= 10) {
                candidates.add(trailingDigits);
            }
        }
        return new ArrayList<>(candidates);
    }

    private List<String> deriveRegisterNoSuffixCandidates(String identifier) {
        Set<String> suffixes = new LinkedHashSet<>();
        String lower = identifier.toLowerCase();
        if (lower.contains("@")) {
            String local = lower.split("@")[0];
            String trailingDigits = extractTrailingDigits(local);
            if (trailingDigits != null) {
                if (trailingDigits.length() >= 4) {
                    suffixes.add(trailingDigits.substring(trailingDigits.length() - 4));
                }
                if (trailingDigits.length() >= 5) {
                    suffixes.add(trailingDigits.substring(trailingDigits.length() - 5));
                }
            }
        }
        return new ArrayList<>(suffixes);
    }

    private String extractTrailingDigits(String text) {
        if (text == null || text.isBlank()) return null;
        int i = text.length() - 1;
        while (i >= 0 && Character.isDigit(text.charAt(i))) {
            i--;
        }
        String digits = text.substring(i + 1);
        return digits.isBlank() ? null : digits;
    }
}
