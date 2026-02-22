package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "classrooms")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Classroom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(nullable = false)
    private int capacity;

    private int floor;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type")
    private RoomType roomType;

    @Column(name = "has_projector")
    private Boolean hasProjector;

    @Column(name = "has_ac")
    private Boolean hasAc;

    @Column(name = "has_smart_board")
    private Boolean hasSmartBoard;

    @Column(name = "has_wifi")
    private Boolean hasWifi;

    @Column(name = "is_smart_classroom")
    private boolean isSmartClassroom;

    // Alias for getRoomId to satisfy AllocationEngine
    public Long getId() {
        return roomId;
    }
}
