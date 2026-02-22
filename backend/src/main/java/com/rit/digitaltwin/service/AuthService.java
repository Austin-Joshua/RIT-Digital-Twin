package com.rit.digitaltwin.service;

import com.rit.digitaltwin.dto.AuthResponse;
import com.rit.digitaltwin.dto.LoginRequest;
import com.rit.digitaltwin.dto.RegisterRequest;
import com.rit.digitaltwin.model.Role;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.repository.RoleRepository;
import com.rit.digitaltwin.repository.UserRepository;
import com.rit.digitaltwin.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;

        public AuthResponse authenticateUser(LoginRequest loginRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtil.generateToken(authentication);

                User user = (User) authentication.getPrincipal();
                return new AuthResponse(
                                jwt,
                                user.getUserId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getRole().getRoleName());
        }

        public void registerUser(RegisterRequest registerRequest) {
                if (userRepository.existsByUsername(registerRequest.getUsername())) {
                        throw new RuntimeException("Error: Username is already taken!");
                }

                if (userRepository.existsByEmail(registerRequest.getEmail())) {
                        throw new RuntimeException("Error: Email is already in use!");
                }

                // Create new user's account
                User user = User.builder()
                                .username(registerRequest.getUsername())
                                .email(registerRequest.getEmail())
                                .password(passwordEncoder.encode(registerRequest.getPassword()))
                                .build();

                String strRole = registerRequest.getRole();
                Role role;

                if (strRole == null) {
                        role = roleRepository.findByRoleName("FACULTY")
                                        .orElseThrow(() -> new RuntimeException("Error: Role 'FACULTY' is not found."));
                } else {
                        role = roleRepository.findByRoleName(strRole)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Error: Role '" + strRole + "' is not found."));
                }

                user.setRole(role);
                userRepository.save(user);
        }
}
