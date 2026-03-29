package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clubs", indexes = {
        @Index(name = "idx_club_name", columnList = "club_name"),
        @Index(name = "idx_club_category", columnList = "category"),
        @Index(name = "idx_club_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Club extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "club_id")
    private Long clubId;

    @Column(name = "club_name", nullable = false, unique = true, length = 150)
    private String clubName;

    @Column(length = 600)
    private String description;

    @Column(nullable = false, length = 80)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_coordinator_id")
    private User facultyCoordinator;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(nullable = false, length = 20)
    private String status;
}
