package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculty_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faculty_id")
    private Long facultyId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String employeeCode;
    private String department;
    private String status;
}
