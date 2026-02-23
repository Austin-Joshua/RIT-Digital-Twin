package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_skills")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkill extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "proficiency_level")
    private String proficiencyLevel; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications; // Comma separated list or JSON string

}
