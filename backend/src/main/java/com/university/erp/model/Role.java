package com.university.erp.model;

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

    @Transient
    public Long getRoleId() {
        return roleId;
    }

    @Transient
    public Long getId() {
        return roleId;
    }

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private UserRole roleName;

    public enum UserRole {
        ADMIN, STUDENT, FACULTY, PARENT, HOD
    }
}
