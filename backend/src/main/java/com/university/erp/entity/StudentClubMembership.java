package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "student_club_membership", uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_club", columnNames = { "student_id", "club_id" })
}, indexes = {
        @Index(name = "idx_student_club_student_id", columnList = "student_id"),
        @Index(name = "idx_student_club_club_id", columnList = "club_id"),
        @Index(name = "idx_student_club_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class StudentClubMembership extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "membership_id")
    private Long membershipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(name = "role_type", nullable = false, length = 80)
    private String roleType;

    @Column(name = "joined_date", nullable = false)
    private LocalDate joinedDate;

    @Column(nullable = false, length = 20)
    private String status;
}
