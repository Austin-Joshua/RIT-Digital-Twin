package com.university.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FacultySubstitutionDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long timetableSlotId;
        private Long substituteFacultyId;
        private LocalDate substitutionDate;
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Action {
        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Candidate {
        private Long facultyId;
        private String facultyName;
        private String departmentCode;
        private int weeklyWorkloadHours;
        private boolean isSubjectExpert;
        private int matchScore; // e.g. 70-100%
        private String availabilityStatus; // AVAILABLE, BUSY_TEACHING, ON_LEAVE, ALREADY_SUBSTITUTING
        private String conflictReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long originalFacultyId;
        private String originalFacultyName;
        private Long substituteFacultyId;
        private String substituteFacultyName;
        private Long timetableSlotId;
        private String subjectCode;
        private String subjectName;
        private String section;
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private String classroomName;
        private LocalDate substitutionDate;
        private String reason;
        private String status;
        private String requestedByName;
        private LocalDateTime requestedAt;
        private String actionedByName;
        private LocalDateTime actionedAt;
        private String actionRemarks;
    }
}
