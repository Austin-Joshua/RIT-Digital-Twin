package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "parents")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Parent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "parent_student_mapping", joinColumns = @JoinColumn(name = "parent_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
    private Set<Student> students;

    @Column(name = "primary_contact")
    private String primaryContact;
}
