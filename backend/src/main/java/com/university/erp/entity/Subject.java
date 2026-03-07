package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects", indexes = {
        @Index(name = "idx_subject_code", columnList = "subjectCode")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Subject extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getSubjectId() {
        return id;
    }

    private String subjectName;
    private String subjectCode;
    private Integer credits;
    private String regulation; // e.g., "R2023"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private Department department;
}
