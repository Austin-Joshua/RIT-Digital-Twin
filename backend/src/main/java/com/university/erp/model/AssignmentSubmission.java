package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_assignment_student", columnNames = { "assignment_id", "student_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String fileName;
    private Long fileSize;
    private String fileType;
    private String fileUrl;

    private LocalDateTime submissionTimestamp;

    @Builder.Default
    private String status = "SUBMITTED"; // SUBMITTED, GRADED, LATE

    private BigDecimal score;

    @Column(length = 1000)
    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;

    private LocalDateTime gradedAt;

    @PrePersist
    protected void onCreate() {
        if (submissionTimestamp == null) {
            submissionTimestamp = LocalDateTime.now();
        }
    }
}
