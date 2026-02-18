package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "crowd_data")
public class CrowdData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String locationId; // Could be building ID or zone name
    private Integer densityLevel; // 1-100
    private String congestionStatus; // LOW, MEDIUM, HIGH, CRITICAL
    private LocalDateTime timestamp;
}
