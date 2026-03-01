package com.university.erp.security;

import com.university.erp.model.Role;
import com.university.erp.model.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SuppressWarnings("null")
class JwtUtilsTest {
    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // set both fields that the class normally receives via @Value
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "my-super-secret-key-which-is-long-enough");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000); // 1 hour
    }

    private User makeDummyUser() {
        Role role = Role.builder().roleName(Role.UserRole.ADMIN).build();
        return User.builder()
                .username("alice")
                .email("alice@example.com")
                .firstName("Alice")
                .lastName("Anderson")
                .role(role)
                .build();
    }

    @Test
    void generateAndValidateToken_shouldReturnTrue() {
        User user = makeDummyUser();
        String token = jwtUtils.generateToken(user);
        assertThat(token).isNotBlank();
        assertThat(jwtUtils.validateToken(token)).isTrue();
        assertThat(jwtUtils.getUsernameFromToken(token)).isEqualTo(user.getUsername());
    }

    @Test
    void validateToken_withInvalidToken_shouldReturnFalse() {
        String bogus = "this.is.not.a.jwt";
        assertThat(jwtUtils.validateToken(bogus)).isFalse();
    }

    @Test
    void getUsernameFromToken_withMalformedToken_shouldThrow() {
        String bogus = "garbage";
        assertThrows(JwtException.class, () -> jwtUtils.getUsernameFromToken(bogus));
    }
}
