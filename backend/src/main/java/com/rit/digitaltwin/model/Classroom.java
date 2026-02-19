package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "classrooms")
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer capacity;
    private Boolean isSmartClass;

    private Integer floor;
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomType roomType; // LECTURE_HALL, LAB, SEMINAR_HALL

    private Boolean hasProjector;
    private Boolean hasAc;
    private Boolean hasSmartBoard;
    private Boolean hasWifi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;
}
