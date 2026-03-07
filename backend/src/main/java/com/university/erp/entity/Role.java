package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    public Long getRoleId() {
        return roleId;
    }

    public Long getId() {
        return roleId;
    }

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private UserRole roleName;

    public enum UserRole {
        ADMIN, STUDENT, FACULTY, PARENT, MANAGEMENT, SUPER_ADMIN
    }
}
