package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments", indexes = {
        @Index(name = "idx_dept_code", columnList = "code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String deptName;

    @Column(unique = true, nullable = false)
    private String code;
}
