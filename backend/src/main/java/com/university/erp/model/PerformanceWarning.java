package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_warnings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class PerformanceWarning extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String status; // On Track, Needs Attention, Critical

    private String observation; // e.g., Low Internal Marks in Subject X

    private String recommendation; // e.g., Remedial Sessions

    private LocalDateTime analyzedAt;

    private Boolean isResolved;
}
