package com.university.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "student_leave_requests")
public class StudentLeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId; // Register Number
    private String type;      // LEAVE or OD
    private String startDate;
    private String endDate;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    private String status;    // PENDING, APPROVED, REJECTED
    private String studentName;
}
