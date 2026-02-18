package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms", indexes = {
        @Index(name = "idx_building_id", columnList = "building_id"),
        @Index(name = "idx_room_type", columnList = "room_type"),
        @Index(name = "idx_capacity", columnList = "capacity"),
        @Index(name = "idx_available", columnList = "is_available")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(nullable = false)
    private Integer floor;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 60;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    @Builder.Default
    private RoomType roomType = RoomType.LECTURE_HALL;

    @Column(name = "has_projector")
    @Builder.Default
    private Boolean hasProjector = true;

    @Column(name = "has_ac")
    @Builder.Default
    private Boolean hasAc = false;

    @Column(name = "has_smart_board")
    @Builder.Default
    private Boolean hasSmartBoard = false;

    @Column(name = "has_wifi")
    @Builder.Default
    private Boolean hasWifi = true;

    @Column(name = "area_sqft")
    private BigDecimal areaSqft;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
