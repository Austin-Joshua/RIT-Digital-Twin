package com.university.erp.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "faculty_leave_request", indexes = {
        @Index(name = "idx_faculty_id", columnList = "facultyId")
})
public class FacultyLeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String facultyId;
    private String facultyName;
    private String leaveType;
    private String startDate;
    private String endDate;
    private String status;
}
