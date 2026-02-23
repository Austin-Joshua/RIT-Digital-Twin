package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "placement_data")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PlacementData extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_record_id", nullable = false)
    private Student student;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "placed_company")
    private String placedCompany;

    @Column(name = "package_ctc")
    private Double packageCtc;

    @Enumerated(EnumType.STRING)
    @Column(name = "placement_status")
    private PlacementStatus status;

    public enum PlacementStatus {
        ELIGIBLE, NOT_ELIGIBLE, PLACED, UNPLACED
    }
}
