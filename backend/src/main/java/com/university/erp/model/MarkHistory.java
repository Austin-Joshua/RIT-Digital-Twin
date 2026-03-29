package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mark_history", indexes = {
        @Index(name = "idx_mark_id", columnList = "mark_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mark_id", nullable = false)
    private Marks mark;

    private String fieldName;
    private String oldValue;
    private String newValue;

    private String changedBy;

    @Builder.Default
    private LocalDateTime changedAt = LocalDateTime.now();
}
