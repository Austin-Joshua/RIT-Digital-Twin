package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "substitution_logs")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SubstitutionLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    private Timetable originalTimetable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "substitute_faculty_id", nullable = false)
    private Faculty substituteFaculty;

    @Column(name = "reason")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SubstitutionStatus status;

    public enum SubstitutionStatus {
        AUTO_ASSIGNED, OVERRIDDEN, COMPLETED
    }
}
