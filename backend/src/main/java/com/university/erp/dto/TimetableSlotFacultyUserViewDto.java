package com.university.erp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableSlotFacultyUserViewDto {
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
}
