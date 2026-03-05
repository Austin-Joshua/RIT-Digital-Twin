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
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private UserRole roleName;

    public enum UserRole {
        SUPER_ADMIN, ADMIN, MANAGEMENT, HOD, FACULTY, STUDENT, PARENT
    }
}
