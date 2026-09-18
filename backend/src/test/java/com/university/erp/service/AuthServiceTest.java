package com.university.erp.service;

import com.university.erp.dto.RegisterRequest;
import com.university.erp.dto.ProvisionRequest;
import com.university.erp.model.Role;
import com.university.erp.model.User;
import com.university.erp.repository.RoleRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.repository.EmailVerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterAlwaysAssignsStudentRoleAndGeneratesToken() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@ritchennai.edu.in");
        request.setPassword("password");
        request.setFirstName("Test");
        request.setLastName("User");

        Role studentRole = new Role();
        studentRole.setRoleName(Role.UserRole.STUDENT);

        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.empty());
        when(roleRepository.findByRoleName(Role.UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setUserId(1L);
            return u;
        });

        String result = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        
        User savedUser = userCaptor.getValue();
        assertEquals("testuser", savedUser.getUsername());
        assertEquals("STUDENT", savedUser.getRole().getRoleName().name());
        assertEquals("unverified", savedUser.getAccountStatus());
        
        verify(emailVerificationTokenRepository).save(any());
        assertTrue(result.contains("verify your account"));
    }
    
    @Test
    void testProvisionAccountWithAdminRole() {
        ProvisionRequest request = new ProvisionRequest();
        request.setUsername("adminuser");
        request.setEmail("adminuser@ritchennai.edu.in");
        request.setPassword("password");
        request.setFirstName("Admin");
        request.setLastName("User");
        request.setRole("ADMIN");
        
        Role adminRole = new Role();
        adminRole.setRoleName(Role.UserRole.ADMIN);

        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.empty());
        when(roleRepository.findByRoleName(Role.UserRole.ADMIN)).thenReturn(Optional.of(adminRole));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        
        String result = authService.provisionAccount(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        
        User savedUser = userCaptor.getValue();
        assertEquals("adminuser", savedUser.getUsername());
        assertEquals("ADMIN", savedUser.getRole().getRoleName().name());
        assertEquals("active", savedUser.getAccountStatus());
        assertEquals("Account provisioned successfully!", result);
    }
}
