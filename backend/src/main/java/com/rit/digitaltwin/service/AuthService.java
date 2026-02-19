package com.rit.digitaltwin.service;

import com.rit.digitaltwin.dto.AuthRequest;
import com.rit.digitaltwin.dto.AuthResponse;
import com.rit.digitaltwin.dto.RegisterRequest;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.repository.UserRepository;
import com.rit.digitaltwin.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(RegisterRequest request) {
                var user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole())
                                .build();
                repository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .role(user.getRole().getRoleName())
                                .build();
        }

        public AuthResponse authenticate(AuthRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .role(user.getRole().getRoleName())
                                .build();
        }
}
