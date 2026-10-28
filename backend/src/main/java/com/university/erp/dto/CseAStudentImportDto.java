package com.university.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CseAStudentImportDto {
    private String registerNo;
    private String name;
    private String scholarType; // Day Scholar / Hosteller
    private String email;
    private String phone;
}
