package com.university.erp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Transient
    public Long getUserId() {
        return userId;
    }

    @Transient
    public Long getId() {
        return userId;
    }

    @Column(unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", nullable = false)
    @JsonIgnore
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true)
    private String googleId;

    private String firstName;
    private String lastName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_student_id")
    private Student linkedStudent;

    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private String accountStatus = "active";

    @Column(name = "must_change_password")
    private boolean mustChangePassword;

    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts;

    @Column(name = "lock_until")
    private LocalDateTime lockUntil;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "last_password_change")
    private LocalDateTime lastPasswordChange;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null || role.getRoleName() == null) {
            return List.of(new SimpleGrantedAuthority("ROLE_STUDENT"));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.getRoleName().name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        if ("locked".equalsIgnoreCase(accountStatus)) {
            return false;
        }
        if (lockUntil != null && lockUntil.isAfter(LocalDateTime.now())) {
            return false;
        }
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !"deactivated".equalsIgnoreCase(accountStatus);
    }
}
