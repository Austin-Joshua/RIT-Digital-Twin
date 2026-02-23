package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "faculty_details")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Faculty extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faculty_record_id")
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "faculty_id_number", unique = true, nullable = false)
    private String facultyIdNumber;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "faculty_subjects", joinColumns = @JoinColumn(name = "faculty_record_id"), inverseJoinColumns = @JoinColumn(name = "subject_id"))
    private Set<Subject> assignedSubjects;
}
