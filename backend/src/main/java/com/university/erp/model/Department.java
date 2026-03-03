package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity(name="ModelDepartment")
@Table(name = "model_departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String deptName;

    @Column(unique = true, nullable = false)
    private String code;
}
